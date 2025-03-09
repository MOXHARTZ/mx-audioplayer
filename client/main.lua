InvokingResource = nil
local currentResourceName = GetCurrentResourceName()
local UiReady = false
ShortDisplayData = {} --[[@as ShortDisplay]]
CustomId = nil
local playlist, currentSounds, audioplayerHandlers = {}, {}, {}
Surround = exports['mx-surround']
---@type number -- Audio Player's custom volume
AudioVolume = 1
local playQuietly = false
local audioPlayer = {}
local vehicleEvents = {
    ['enter'] = 'mx-audioplayer:vehicleEntered',
    ['leave'] = 'mx-audioplayer:vehicleLeft'
}

PlayerPed = PlayerPedId()
PlayerCoords = GetEntityCoords(PlayerPed)
CurrentVehicle = GetVehiclePedIsIn(PlayerPed, false)

CreateThread(function()
    while not UiReady do Wait(200) end
    while true do
        PlayerPed = PlayerPedId()
        PlayerCoords = GetEntityCoords(PlayerPed)
        CurrentVehicle = GetVehiclePedIsIn(PlayerPed, false)
        if IsInVehicle ~= (CurrentVehicle ~= 0) then
            local entered = CurrentVehicle ~= 0
            TriggerEvent(vehicleEvents[entered and 'enter' or 'leave'], CurrentVehicle)
            IsInVehicle = CurrentVehicle ~= 0
        end
        Wait(300)
    end
end)

---@param data? OpenAudioPlayerData
local function initAudioPlayerData(id, data)
    local audioPlayerData = {}
    if not data then
        audioPlayer[id] = audioPlayerData
        return
    end
    if data.staySameCoords then
        audioPlayerData.coords = PlayerCoords
    end
    if data.panner then
        audioPlayerData.panner = data.panner
    end
    audioPlayer[id] = audioPlayerData
end

---@param data OpenAudioPlayerData
---@return false | table, string?
local function getAudioPlayerInfo(data)
    CustomId = data.customId
    InvokingResource = GetInvokingResource() or ''
    InvokingResource = InvokingResource == currentResourceName and '' or InvokingResource
    CustomId = CustomId or ''
    local id = InvokingResource .. CustomId
    if CustomId ~= '' then
        local uiDisabled = lib.callback.await('mx-audioplayer:isUiDisabled', 0, id)
        if uiDisabled then
            Surround:pushNotification(_U('general.ui.disabled'))
            return false
        end
    else
        Debug('No custom id provided')
    end
    local _playlist = GetResourceKvpString('mx_audioplayer_playlist')
    _playlist = _playlist and json.decode(_playlist) or {}
    if currentSounds[id] then
        for k, v in pairs(_playlist) do
            if v.id == currentSounds[id].id and currentSounds[id].duration then
                _playlist[k].duration = math.floor(currentSounds[id].duration)
                break
            end
        end
    end
    initAudioPlayerData(id, data)
    return _playlist, id
end



---@param data? OpenAudioPlayerData
---@param handlers? OpenAudioPlayerHandlers
function OpenAudioPlayer(data, handlers)
    data = data or {}
    local silent = data.silent
    local _playlist, id = getAudioPlayerInfo(data)
    Debug('OpenAudioPlayer ::: id', id, 'playlist', _playlist)
    handlers = handlers or {}
    if not _playlist or not id then return Debug('Error getting audio player info') end
    playQuietly = silent and true or false
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        data = {
            playlist = _playlist,
            currentSound = currentSounds[id]
        }
    })
    audioplayerHandlers[id] = handlers
    TriggerServerEvent('mx-audioplayer:disableUi', id, true)
end

local function shortDisplayKeyListener()
    CreateThread(function()
        while ShortDisplayData.state do
            -- shift arrow right
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 175) then
                SendNUIMessage({
                    action = 'nextSong'
                })
            end
            -- shift arrow left
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 174) then
                SendNUIMessage({
                    action = 'previousSong'
                })
            end
            -- shift k
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 311) then
                SendNUIMessage({
                    action = 'togglePlay'
                })
            end
            -- shift arrow up
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 172) then
                SendNUIMessage({
                    action = 'volumeUp'
                })
            end
            -- shift arrow down
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 173) then
                SendNUIMessage({
                    action = 'volumeDown'
                })
            end
            Wait(0)
        end
    end)
end

---@param state boolean
---@param data? ShortDisplay Not necessary if state is false
function ToggleShortDisplay(state, data)
    ShortDisplayData = data or {}
    ShortDisplayData.state = state
    if not state then
        SendNUIMessage({
            action = 'toggleShortDisplay',
            data = {
                state = state,
            }
        })
        return
    end
    data = data or {}
    local _playlist, id = getAudioPlayerInfo({ customId = data.customId })
    if not _playlist or not id then return Debug('ToggleShortDisplay ::: Error getting audio player info') end
    SendNUIMessage({
        action = 'toggleShortDisplay',
        data = {
            state = state,
            playlist = _playlist,
            currentSound = currentSounds[id]
        }
    })
    shortDisplayKeyListener()
    Debug('Short display toggled', state, 'data', data)
end

exports('toggleShortDisplay', ToggleShortDisplay)

exports('open', OpenAudioPlayer)

exports('getVolume', function()
    return AudioVolume
end)

local function onTimeUpdate(soundData)
    if not soundData then return end
    local id = InvokingResource .. CustomId
    if not currentSounds[id] or currentSounds[id].soundId ~= soundData.soundId then return end
    SendNUIMessage({
        action = 'timeUpdate',
        data = {
            time = math.floor(soundData.currentTime),
        }
    })
end

local function onDestroyed(soundData)
    if not soundData then return end
    local id = InvokingResource .. CustomId
    if not currentSounds[id] or currentSounds[id].soundId ~= soundData.soundId then return end
    if audioplayerHandlers[id].onClose then
        audioplayerHandlers[id].onClose(currentSounds[id])
    end
    currentSounds[id] = nil
    SendNUIMessage({
        action = 'destroyed'
    })
end

local function onEnd(soundData)
    if not soundData then return end
    local id = InvokingResource .. CustomId
    if not currentSounds[id] or currentSounds[id].soundId ~= soundData.soundId then return end
    SendNUIMessage({
        action = 'end'
    })
end

RegisterNUICallback('play', function(data, cb)
    local soundData = data.soundData
    if not soundData then
        return cb(false)
    end
    local url = soundData.url
    local soundId = soundData.soundId .. CustomId
    local _volume = data.volume
    local id = InvokingResource .. CustomId
    if currentSounds[id] and (currentSounds[id].soundId) ~= soundId then
        TriggerServerEvent('mx-audioplayer:destroy', currentSounds[id].soundId)
    end
    local audioPlayerData = audioPlayer[id]
    local coords = audioPlayerData.coords or GetEntityCoords(PlayerPed) -- need instant coords
    TriggerServerEvent('mx-audioplayer:play', url, soundId, _volume, InvokingResource, CustomId, playQuietly, coords, audioPlayerData)
    local loaded = Surround:soundIsLoaded(soundId)                      -- wait for the sound to load
    if not loaded then return cb(false) end                             -- if it doesn't load, return false
    local maxDuration = Surround:getMaxDuration(soundId)
    soundData.duration = maxDuration
    soundData.playing = true
    soundData.soundId = soundId
    currentSounds[id] = soundData
    if audioplayerHandlers[id].onPlay then
        audioplayerHandlers[id].onPlay(currentSounds[id])
    end
    Surround:onTimeUpdate(soundId, onTimeUpdate)
    Surround:onDestroy(soundId, onDestroyed)
    Surround:onPlayEnd(soundId, onEnd)
    cb(maxDuration)
end)

RegisterNUICallback('togglePlay', function(data, cb)
    local id = InvokingResource .. CustomId
    if not currentSounds[id] then
        return cb('ok')
    end
    currentSounds[id].playing = data.playing
    if currentSounds[id].playing then
        if audioplayerHandlers[id].onResume then
            audioplayerHandlers[id].onResume(currentSounds[id])
        end
        TriggerServerEvent('mx-audioplayer:resume', currentSounds[id].soundId)
    else
        if audioplayerHandlers[id].onPause then
            audioplayerHandlers[id].onPause(currentSounds[id])
        end
        TriggerServerEvent('mx-audioplayer:pause', currentSounds[id].soundId)
    end
    cb('ok')
end)

RegisterNUICallback('getCurrentSongDuration', function(data, cb)
    local id = InvokingResource .. CustomId
    if not currentSounds[id] then return cb(0) end
    local maxDuration = Surround:getMaxDuration(currentSounds[id].soundId)
    cb(maxDuration)
end)

RegisterNUICallback('getCurrentSongTimeStamp', function(data, cb)
    local id = InvokingResource .. CustomId
    if not currentSounds[id] then return cb(0) end
    local timeStamp = Surround:getTimeStamp(currentSounds[id].soundId)
    cb(math.floor(timeStamp))
end)

RegisterNUICallback('setVolume', function(data, cb)
    local id = InvokingResource .. CustomId
    AudioVolume = data.volume
    if not currentSounds[id] then return cb(0) end
    TriggerServerEvent('mx-audioplayer:setVolume', currentSounds[id].soundId, data.volume)
    if audioplayerHandlers[id].onVolumeChange then
        audioplayerHandlers[id].onVolumeChange(currentSounds[id])
    end
    cb('ok')
end)

RegisterNUICallback('seek', function(data, cb)
    local id = InvokingResource .. CustomId
    if not currentSounds[id] then return cb(0) end
    TriggerServerEvent('mx-audioplayer:seek', currentSounds[id].soundId, data.position)
    if audioplayerHandlers[id].onSeek then
        audioplayerHandlers[id].onSeek(currentSounds[id])
    end
    cb('ok')
end)

RegisterNUICallback('getSoundData', function(data, cb)
    local url = data.url
    local info = Surround:getInfoFromUrl(url)
    cb(info)
end)

RegisterNUICallback('searchQuery', function(data, cb)
    local query = data.query
    local response = Surround:searchTrack(query)
    cb(response)
end)

RegisterNUICallback('searchTracks', function(data, cb)
    local query = data.query
    local response = Surround:searchTracks(query)
    cb(response)
end)

RegisterNUICallback('setPlaylist', function(data, cb)
    playlist = data.playlist
    SetResourceKvp('mx_audioplayer_playlist', json.encode(playlist))
    cb('ok')
end)

---@param data Settings
RegisterNUICallback('saveSettings', function(data, cb)
    SetResourceKvp('mx_audioplayer_settings', json.encode(data))
    Debug('Settings saved', data)
    if data.minimalHud then
        ToggleShortDisplay(true, {
            customId = ShortDisplayData.customId,
            vehicle = IsInVehicle and CurrentVehicle or nil
        })
    end
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    local id = InvokingResource .. CustomId
    SetNuiFocus(false, false)
    if audioplayerHandlers[id].onClose then
        audioplayerHandlers[id].onClose(currentSounds[id])
    end
    TriggerServerEvent('mx-audioplayer:disableUi', id, false)
    cb('ok')
end)

local function languageToI18Next()
    local lang = Config.Locale
    local data = {}
    data[lang] = {}
    data[lang].translation = _T
    return lang, data
end

RegisterNUICallback('uiReady', function(data, cb)
    while not _T do Wait(200) end
    local locale, resources = languageToI18Next()
    local settings = GetResourceKvpString('mx_audioplayer_settings')
    SendNUIMessage({
        action = 'onUiReady',
        data = {
            languageName = locale,
            resources = resources,
            settings = settings and json.decode(settings) or {}
        }
    })
    UiReady = true
    cb('ok')
end)

RegisterNUICallback('getNearbyPlayers', function(data, cb)
    local players = lib.callback.await('mx-audioplayer:getNearbyPlayers', 0)
    cb(players)
end)

RegisterNUICallback('sharePlaylist', function(data, cb)
    local playlist = data.playlist
    local player = data.player
    TriggerServerEvent('mx-audioplayer:sharePlaylist', playlist, player)
    cb('ok')
end)

local function checkPlaylistAlreadyExist(playlist)
    local _playlist = GetResourceKvpString('mx_audioplayer_playlist')
    _playlist = _playlist and json.decode(_playlist) or {}
    local finded = table.find(_playlist, function(v)
        return v.id == playlist.id
    end)
    return finded
end

RegisterNetEvent('mx-audioplayer:receivePlaylist', function(playlist, senderName)
    if checkPlaylistAlreadyExist(playlist) then
        return Surround:pushNotification(_U('playlist.already_exist', senderName, playlist.name))
    end
    SendNUIMessage({
        action = 'receivePlaylist',
        data = playlist
    })
    local _playlist = GetResourceKvpString('mx_audioplayer_playlist')
    _playlist = _playlist and json.decode(_playlist) or {}
    table.insert(_playlist, playlist)
    SetResourceKvp('mx_audioplayer_playlist', json.encode(_playlist))
    Surround:pushNotification(_U('playlist.received', senderName, playlist.name))
end)

function DrawText3D(x, y, z, text)
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry('STRING')
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end
