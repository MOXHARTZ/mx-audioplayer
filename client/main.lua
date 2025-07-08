InvokingResource = nil
local currentResourceName = GetCurrentResourceName()
local UiReady = false
ShortDisplayData = {} --[[@as ShortDisplay]]
CustomId = nil
CurrentSoundData = nil
CurrentSounds = {}
local playlist, audioplayerHandlers = {}, {}
Surround = exports['mx-surround']
---@type number -- Audio Player's custom volume
AudioVolume = 1
local playQuietly = false
local audioPlayer = {}
local vehicleEvents = {
    ['enter'] = 'mx-audioplayer:vehicleEntered',
    ['leave'] = 'mx-audioplayer:vehicleLeft'
}

RegisterNetEvent('mx-audioplayer:notification', function(msg)
    Debug('Notification', msg)
    Surround:pushNotification(msg)
end)

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

---@return string Returns current audioplayer id based on invoking resource and custom id
function GetAudioplayerId()
    return InvokingResource .. CustomId
end

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
    if data.maxDistance then
        audioPlayerData.maxDistance = data.maxDistance
    end
    audioPlayer[id] = audioPlayerData
end

---@param data OpenAudioPlayerData
---@return false | {playlist: table, user: Account | nil}, string?
function GetAudioPlayerInfo(data)
    CustomId = data.customId
    InvokingResource = GetInvokingResource() or ''
    InvokingResource = InvokingResource == currentResourceName and '' or InvokingResource
    CustomId = CustomId or ''
    local id = GetAudioplayerId()

    if CustomId ~= '' then
        local uiDisabled = lib.callback.await('mx-audioplayer:isUiDisabled', 0, id)
        if uiDisabled then
            Surround:pushNotification(_U('general.ui.disabled'))
            return false
        end
    else
        Debug('No custom id provided')
    end

    local playerData = lib.callback.await('mx-audioplayer:getData', 0, id) --[[@as {playlist: table, user: Account | nil, player: Player}]]
    CurrentSoundData = playerData.player and playerData.player.soundData
    if CurrentSoundData and playerData.playlist then
        for k, v in pairs(playerData.playlist) do
            if v.id == CurrentSoundData.id then
                playerData.playlist[k].duration = Surround:getMaxDuration(CurrentSoundData.soundId)
                break
            end
        end
    end

    initAudioPlayerData(id, data)
    return playerData, id
end

---@param message string
---@param data any
function SendReactMessage(message, data)
    SendNUIMessage({
        action = message,
        data = data
    })
end

---@param data? OpenAudioPlayerData
---@param handlers? OpenAudioPlayerHandlers
function OpenAudioPlayer(data, handlers)
    data = data or {}
    local silent = data.silent
    local playerData, id = GetAudioPlayerInfo(data)
    if not playerData then return Error('Error getting audio player info') end
    Debug('OpenAudioPlayer ::: id', id, 'playlist', playerData.playlist)
    handlers = handlers or {}
    if not id then
        return Error('Error getting audio player info')
    end
    playQuietly = silent and true or false
    audioplayerHandlers[id] = handlers
    SendReactMessage('open', {
        playlist = playerData.playlist,
        currentSound = CurrentSoundData,
        user = playerData.user,
        volume = CurrentSoundData and CurrentSoundData.volume or AudioVolume,
    })
    TriggerListener(id, 'onOpen')
    SetNuiFocus(true, true)
    TriggerServerEvent('mx-audioplayer:disableUi', id, true)
end

RegisterNUICallback('handleChangePage', function(data, cb)
    local id = GetAudioplayerId()
    if data.page == 'login' then
        TriggerListener(id, 'autoLogin')
    end
end)

---@param id string
---@param listenerName string
function TriggerListener(id, listenerName, ...)
    if audioplayerHandlers[id][listenerName] then
        audioplayerHandlers[id][listenerName](CurrentSoundData, ...)
    end
end

exports('open', OpenAudioPlayer)

exports('getVolume', function()
    return CurrentSoundData and CurrentSoundData.volume or 1
end)

local function onTimeUpdate(soundData)
    if not soundData then return end
    local id = GetAudioplayerId()
    if not CurrentSoundData or CurrentSoundData.soundId ~= soundData.soundId then return end
    SendNUIMessage({
        action = 'timeUpdate',
        data = {
            time = math.floor(soundData.currentTime),
        }
    })
end

local function onDestroyed(soundData)
    if not soundData then return end
    local id = GetAudioplayerId()
    if not CurrentSoundData or CurrentSoundData.soundId ~= soundData.soundId then return end
    TriggerListener(id, 'onClose')
    CurrentSoundData = nil
    SendNUIMessage({
        action = 'destroyed'
    })
end

local function onEnd(soundData)
    if not soundData then return end
    local id = GetAudioplayerId()
    if not CurrentSoundData or CurrentSoundData.soundId ~= soundData.soundId then return end
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
    local id = GetAudioplayerId()
    -- if CurrentSounds[id] and (CurrentSounds[id].soundId) ~= soundId then
    --     TriggerServerEvent('mx-audioplayer:destroy', CurrentSounds[id].soundId)
    -- end
    local audioPlayerData = audioPlayer[id]
    local coords = audioPlayerData.coords or GetEntityCoords(PlayerPed) -- need instant coords
    soundData.soundId = soundId
    soundData.playing = true
    soundData.volume = _volume
    TriggerServerEvent('mx-audioplayer:play', id, url, soundId, soundData, _volume, playQuietly, coords, audioPlayerData)
    local loaded = Surround:soundIsLoaded(soundId) -- wait for the sound to load
    if not loaded then return cb(false) end        -- if it doesn't load, return false
    local maxDuration = Surround:getMaxDuration(soundId)
    soundData.duration = maxDuration
    CurrentSoundData = soundData
    TriggerListener(id, 'onPlay')
    Surround:onTimeUpdate(soundId, onTimeUpdate)
    Surround:onDestroy(soundId, onDestroyed)
    Surround:onPlayEnd(soundId, onEnd)
    cb(maxDuration)
end)

RegisterNUICallback('togglePlay', function(data, cb)
    local id = GetAudioplayerId()
    if not CurrentSoundData then
        return cb('ok')
    end
    CurrentSoundData.playing = data.playing
    if CurrentSoundData.playing then
        TriggerListener(id, 'onResume')
        TriggerServerEvent('mx-audioplayer:resume', id, CurrentSoundData.soundId)
    else
        TriggerListener(id, 'onPause')
        TriggerServerEvent('mx-audioplayer:pause', id, CurrentSoundData.soundId)
    end
    cb('ok')
end)

RegisterNUICallback('getCurrentSongDuration', function(data, cb)
    local id = GetAudioplayerId()
    if not CurrentSoundData then return cb(0) end
    local maxDuration = Surround:getMaxDuration(CurrentSoundData.soundId)
    cb(maxDuration)
end)

RegisterNUICallback('getCurrentSongTimeStamp', function(data, cb)
    local id = GetAudioplayerId()
    if not CurrentSoundData then return cb(0) end
    local timeStamp = Surround:getTimeStamp(CurrentSoundData.soundId)
    cb(math.floor(timeStamp))
end)

RegisterNUICallback('setVolume', function(data, cb)
    local id = GetAudioplayerId()
    if not CurrentSoundData then return cb(0) end
    AudioVolume = data.volume
    CurrentSoundData.volume = data.volume
    TriggerServerEvent('mx-audioplayer:setVolume', id, CurrentSoundData.soundId, data.volume)
    TriggerListener(id, 'onVolumeChange')
    cb('ok')
end)

RegisterNUICallback('seek', function(data, cb)
    local id = GetAudioplayerId()
    if not CurrentSoundData then return cb(0) end
    TriggerServerEvent('mx-audioplayer:seek', CurrentSoundData.soundId, data.position)
    TriggerListener(id, 'onSeek')
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
    local id = GetAudioplayerId()
    TriggerServerEvent('mx-audioplayer:setPlaylist', id, playlist)
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
    local id = GetAudioplayerId()
    SetNuiFocus(false, false)
    TriggerListener(id, 'onClose')
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

function CloseUI()
    SendNUIMessage({
        action = 'close'
    })
end
