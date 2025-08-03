local uiReady = false
local playlist = {}
Surround = exports['mx-surround']
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

CreateThread(function()
    while not uiReady do Wait(200) end
    TriggerEvent(vehicleEvents[cache.vehicle and 'enter' or 'leave'], cache.vehicle)
end)

lib.onCache('vehicle', function(vehicle)
    if vehicle then
        TriggerEvent(vehicleEvents['enter'], vehicle)
    else
        TriggerEvent(vehicleEvents['leave'], vehicle)
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
    cb('ok')
    if data.page == 'login' then
        audioplayer:triggerListener('autoLogin')
    end
end)

exports('open', audioplayer.open)

exports('getVolume', function()
    local player = audioplayer:getPlayer()
    return player.volume or 1
end)

RegisterNUICallback('play', function(data, cb)
    local soundData = data.soundData
    if not soundData then return cb(false) end

    local id = audioplayer.id
    local options = audioplayer.options
    local soundId = soundData.soundId .. id
    local coords = options?.coords or GetEntityCoords(cache.ped) -- need instant coords

    local player = lib.callback.await('mx-audioplayer:play', false, id, {
        soundId = soundId,
        soundData = soundData,
        coords = coords,
        options = options
    })
    if not player then return cb(false) end
    cb(true)
end)

RegisterNetEvent('mx-audioplayer:setWaitingForResponse', function(id, loading)
    if audioplayer.id ~= id then return end
    SendReactMessage('setWaitingForResponse', loading)
end)

RegisterNetEvent('mx-audioplayer:setPlaylist', function(playlist)
    audioplayer:setPlaylist(playlist)
end)

RegisterNUICallback('togglePlay', function(playing, cb)
    local id, player = audioplayer.id, audioplayer:getPlayer()
    if not player then
        return cb('ok')
    end
    audioplayer:updatePlayerData({
        playing = playing
    })
    local soundId = player.soundId
    if player.playing then
        audioplayer:triggerListener('onResume')
        TriggerServerEvent('mx-audioplayer:resume', id, soundId)
    else
        audioplayer:triggerListener('onPause')
        TriggerServerEvent('mx-audioplayer:pause', id, soundId)
    end
    cb('ok')
end)

RegisterNUICallback('setRepeat', function(state, cb)
    local id, player = audioplayer.id, audioplayer:getPlayer()
    if not player then
        return cb('ok')
    end
    audioplayer:updatePlayerData({
        -- lua doesn't support `repeat` as data or variable so we need to use this shitty name
        repeatState = state
    })
    TriggerServerEvent('mx-audioplayer:setRepeat', id, state)
    cb('ok')
end)

RegisterNUICallback('setShuffle', function(state, cb)
    local id, player = audioplayer.id, audioplayer:getPlayer()
    if not player then
        return cb('ok')
    end
    audioplayer:updatePlayerData({
        shuffle = state
    })
    TriggerServerEvent('mx-audioplayer:setShuffle', id, state)
    cb('ok')
end)

RegisterNUICallback('setCurrentPlaylistId', function(playlistId, cb)
    local id, player = audioplayer.id, audioplayer:getPlayer()
    if not player then
        return cb('ok')
    end
    audioplayer:updatePlayerData({
        currentPlaylistId = playlistId
    })
    TriggerServerEvent('mx-audioplayer:setCurrentPlaylistId', id, playlistId)
    cb('ok')
end)

RegisterNUICallback('getCurrentSongDuration', function(data, cb)
    local player = audioplayer:getPlayer()
    if not player then return cb(0) end
    local maxDuration = Surround:getMaxDuration(player.soundId)
    cb(maxDuration)
end)

RegisterNUICallback('getCurrentSongTimeStamp', function(data, cb)
    local player = audioplayer:getPlayer()
    if not player then return cb(0) end
    local timeStamp = Surround:getTimeStamp(player.soundId)
    cb(math.floor(timeStamp))
end)

RegisterNUICallback('setVolume', function(data, cb)
    local id, player = audioplayer.id, audioplayer:getPlayer()
    if not player then return cb(0) end
    audioplayer:updatePlayerData({
        volume = data.volume
    })
    TriggerServerEvent('mx-audioplayer:setVolume', id, player.soundId, data.volume)
    audioplayer:triggerListener('onVolumeChange')
    cb('ok')
end)

RegisterNUICallback('seek', function(data, cb)
    local player = audioplayer:getPlayer()
    if not player then return cb(0) end
    audioplayer:updatePlayerData({
        playing = true
    })
    TriggerServerEvent('mx-audioplayer:seek', player.soundId, data.position)
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
    local id = audioplayer.id
    TriggerServerEvent('mx-audioplayer:setPlaylist', id, playlist)
    cb('ok')
end)

---@param data Settings
RegisterNUICallback('saveSettings', function(data, cb)
    SetResourceKvp('mx_audioplayer_settings', json.encode(data))
    if data.minimalHud then
        audioplayer:toggleShortDisplay(true, {
            id = audioplayer.shortDisplay.customId,
            vehicle = cache.vehicle
        })
    end
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    audioplayer:close()
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
    uiReady = true
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
    local find = table.find(_playlist, function(v)
        return v.id == playlist.id
    end)
    return find
end

RegisterNetEvent('mx-audioplayer:receivePlaylist', function(playlist, senderName)
    if checkPlaylistAlreadyExist(playlist) then
        Notification(i18n.t('playlist.already_exist', {
            senderName = senderName,
            playlistName = playlist.name
        }), 'error')
        return
    end
    SendNUIMessage({
        action = 'receivePlaylist',
        data = playlist
    })
    local _playlist = GetResourceKvpString('mx_audioplayer_playlist')
    _playlist = _playlist and json.decode(_playlist) or {}
    table.insert(_playlist, playlist)
    SetResourceKvp('mx_audioplayer_playlist', json.encode(_playlist))
    Notification(i18n.t('playlist.received', {
        senderName = senderName,
        playlistName = playlist.name
    }), 'success')
end)

---@param data Player
RegisterNetEvent('mx-audioplayer:playSound', function(data)
    local _id = audioplayer.id
    if _id ~= data.id then
        Debug('mx-audioplayer:playSound ::: id is not the same', '_id', _id, 'data.id', data.id)
        return
    end
    if audioplayer.shortDisplay.visible then
        audioplayer:toggleShortDisplay(true, {
            vehicle = cache.vehicle,
            id = data.id
        })
    end
    audioplayer:setPlayerData(data)
    audioplayer:triggerListener('onPlay')
    SendReactMessage('setCurrentSong', data)
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
