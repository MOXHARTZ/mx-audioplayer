local invokingResource, customId
local playlist, currentSounds, audioplayerHandlers = {}, {}, {}
local Surround = exports['mx-surround']
local callback = Surround:callback()
local volume = 1
local playQuietly = false

---@param handlers? {onPlay: function, onPause: function, onResume: function, onVolumeChange: function, onSeek: function, onClose: function}
---@param _customId? string
---@param silent? boolean @If true, volume will be set to 0
local function openUi(handlers, _customId, silent)
    if not handlers then handlers = {} end
    playQuietly = silent and true or false
    invokingResource = GetInvokingResource() or ''
    customId = _customId or ''
    local id = invokingResource .. customId
    local uiDisabled = callback.await('mx-audioplayer:isUiDisabled', 0, id)
    if uiDisabled then return Surround:pushNotification('At the moment you can\'t open the radio cause its using by another player.') end
    local _playlist = GetResourceKvpString('audioplayer_playlist_' .. (invokingResource))
    SetNuiFocus(true, true)
    _playlist = _playlist and json.decode(_playlist) or {}
    if currentSounds[id] then
        for k, v in pairs(_playlist) do
            if v.id == currentSounds[id].id and currentSounds[id].duration then
                _playlist[k].duration = math.floor(currentSounds[id].duration)
                break
            end
        end
    end
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

exports('open', openUi)

exports('getVolume', function()
    return volume
end)

local function onTimeUpdate(soundData)
    if not soundData then return end
    local id = invokingResource .. customId
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
    local id = invokingResource .. customId
    if not currentSounds[id] or currentSounds[id].soundId ~= soundData.soundId then return end
    if audioplayerHandlers[id].onClose then
        audioplayerHandlers[id].onClose(currentSounds[id])
    end
    currentSounds[id] = nil
    SendNUIMessage({
        action = 'destroyed'
    })
end

RegisterNUICallback('play', function(data, cb)
    local soundData = data.soundData
    if not soundData then
        return cb(false)
    end
    local url = soundData.url
    local soundId = soundData.soundId .. customId
    local _volume = data.volume
    local id = invokingResource .. customId
    if currentSounds[id] and (currentSounds[id].soundId) ~= soundId then
        TriggerServerEvent('mx-audioplayer:destroy', currentSounds[id].soundId)
    end
    TriggerServerEvent('mx-audioplayer:play', url, soundId, _volume, invokingResource, customId, playQuietly)
    local loaded = Surround:soundIsLoaded(soundId) -- wait for the sound to load
    if not loaded then return cb(false) end        -- if it doesn't load, return false
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
    cb(maxDuration)
end)

RegisterNUICallback('togglePlay', function(data, cb)
    local id = invokingResource .. customId
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
        TriggerServerEvent('mx-audioplayer:stop', currentSounds[id].soundId)
    end
    cb('ok')
end)

RegisterNUICallback('setVolume', function(data, cb)
    local id = invokingResource .. customId
    volume = data.volume
    if not currentSounds[id] then return cb(0) end
    TriggerServerEvent('mx-audioplayer:setVolume', currentSounds[id].soundId, data.volume)
    if audioplayerHandlers[id].onVolumeChange then
        audioplayerHandlers[id].onVolumeChange(currentSounds[id])
    end
    cb('ok')
end)

RegisterNUICallback('seek', function(data, cb)
    local id = invokingResource .. customId
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

RegisterNUICallback('setPlaylist', function(data, cb)
    playlist = data.playlist
    SetResourceKvp('audioplayer_playlist_' .. (invokingResource or ''), json.encode(playlist))
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    local id = invokingResource .. customId
    SetNuiFocus(false, false)
    if audioplayerHandlers[id].onClose then
        audioplayerHandlers[id].onClose(currentSounds[id])
    end
    TriggerServerEvent('mx-audioplayer:disableUi', id, false)
    cb('ok')
end)
