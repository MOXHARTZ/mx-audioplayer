InvokingResource = nil
CurrentResourceName = GetCurrentResourceName()
local audioplayer = require 'client.modules.audioplayer'
local UiReady = false
CustomId = nil
CurrentSounds = {}
local playlist, audioplayerHandlers = {}, {}
Surround = exports['mx-surround']
---@type number -- Audio Player's custom volume
AudioVolume = 1
local playQuietly = false
local vehicleEvents = {
    ['enter'] = 'mx-audioplayer:vehicleEntered',
    ['leave'] = 'mx-audioplayer:vehicleLeft'
}

RegisterNetEvent('mx-audioplayer:notification', function(msg, type)
    Notification(msg, type)
end)

---@param data {message: string, type: 'info' | 'error' | 'success'}
RegisterNUICallback('notification', function(data, cb)
    Notification(data.message, data.type)
    cb('ok')
end)

---@param msg string
---@param type 'info' | 'error' | 'success'
function Notification(msg, type)
    SendReactMessage('notification', {
        msg = msg,
        type = type
    })
    -- if type == 'info' then
    --     lib.notify({
    --         title = 'AUDIOPLAYER',
    --         description = msg,
    --         type = 'info'
    --     })
    -- elseif type == 'error' then
    --     lib.notify({
    --         title = 'AUDIOPLAYER',
    --         description = msg,
    --         type = 'error'
    --     })
    -- elseif type == 'success' then
    --     lib.notify({
    --         title = 'AUDIOPLAYER',
    --         description = msg,
    --         type = 'success'
    --     })
    -- end
end

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

---@param message string
---@param data any
function SendReactMessage(message, data)
    SendNUIMessage({
        action = message,
        data = data
    })
end

RegisterNUICallback('handleChangePage', function(data, cb)
    if data.page == 'login' then
        audioplayer:triggerListener('autoLogin')
    end
end)



exports('open', audioplayer.open)

exports('getVolume', function()
    local soundData = audioplayer:getSoundData()
    return soundData and soundData.volume or 1
end)

RegisterNUICallback('play', function(data, cb)
    local soundData = data.soundData
    if not soundData then
        return cb(false)
    end
    local url = soundData.url
    local id = audioplayer:getId()
    local soundId = soundData.soundId .. id
    local _volume = data.volume
    local audioPlayerData = audioplayer.options
    local coords = audioPlayerData?.coords or GetEntityCoords(PlayerPed) -- need instant coords
    soundData.soundId = soundId
    soundData.playing = true
    soundData.volume = _volume
    local playerData = lib.callback.await('mx-audioplayer:play', 0, id, url, soundId, soundData, _volume, playQuietly, coords, audioPlayerData)
    if not playerData then
        return cb(false)
    end
    -- local loaded = Surround:soundIsLoaded(soundId) -- wait for the sound to load
    -- if not loaded then return cb(false) end        -- if it doesn't load, return false
    local maxDuration = Surround:getMaxDuration(soundId)
    soundData.duration = maxDuration
    audioplayer:setPlayerData(playerData)
    audioplayer:triggerListener('onPlay')
    cb(maxDuration)
end)

RegisterNUICallback('togglePlay', function(data, cb)
    local id, soundData = audioplayer:getId(), audioplayer:getSoundData()
    if not soundData then
        return cb('ok')
    end
    soundData.playing = data.playing
    if soundData.playing then
        audioplayer:triggerListener('onResume')
        TriggerServerEvent('mx-audioplayer:resume', id, soundData.soundId)
    else
        audioplayer:triggerListener('onPause')
        TriggerServerEvent('mx-audioplayer:pause', id, soundData.soundId)
    end
    cb('ok')
end)

RegisterNUICallback('getCurrentSongDuration', function(data, cb)
    local soundData = audioplayer:getSoundData()
    if not soundData then return cb(0) end
    local maxDuration = Surround:getMaxDuration(soundData.soundId)
    cb(maxDuration)
end)

RegisterNUICallback('getCurrentSongTimeStamp', function(data, cb)
    local soundData = audioplayer:getSoundData()
    if not soundData then return cb(0) end
    local timeStamp = Surround:getTimeStamp(soundData.soundId)
    cb(math.floor(timeStamp))
end)

RegisterNUICallback('setVolume', function(data, cb)
    local id, soundData = audioplayer:getId(), audioplayer:getSoundData()
    if not soundData then return cb(0) end
    AudioVolume = data.volume
    soundData.volume = data.volume
    TriggerServerEvent('mx-audioplayer:setVolume', id, soundData.soundId, data.volume)
    audioplayer:triggerListener('onVolumeChange')
    cb('ok')
end)

RegisterNUICallback('seek', function(data, cb)
    local soundData = audioplayer:getSoundData()
    if not soundData then return cb(0) end
    TriggerServerEvent('mx-audioplayer:seek', soundData.soundId, data.position)
    audioplayer:triggerListener('onSeek')
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
    local id = audioplayer:getId()
    TriggerServerEvent('mx-audioplayer:setPlaylist', id, playlist)
    cb('ok')
end)

---@param data Settings
RegisterNUICallback('saveSettings', function(data, cb)
    SetResourceKvp('mx_audioplayer_settings', json.encode(data))
    Debug('Settings saved', data)
    if data.minimalHud then
        audioplayer:toggleShortDisplay(true, {
            customId = audioplayer.shortDisplay.customId,
            vehicle = IsInVehicle and CurrentVehicle or nil
        })
    end
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    local id = audioplayer:getId()
    SetNuiFocus(false, false)
    audioplayer:triggerListener('onClose')
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
        return Notification(i18n.t('playlist.already_exist', senderName, playlist.name), 'error')
    end
    SendNUIMessage({
        action = 'receivePlaylist',
        data = playlist
    })
    local _playlist = GetResourceKvpString('mx_audioplayer_playlist')
    _playlist = _playlist and json.decode(_playlist) or {}
    table.insert(_playlist, playlist)
    SetResourceKvp('mx_audioplayer_playlist', json.encode(_playlist))
    Notification(i18n.t('playlist.received', senderName, playlist.name), 'success')
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
