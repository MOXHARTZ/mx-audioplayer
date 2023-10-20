local invokingResource
local playlist, currentSounds, audioplayerHandlers = {}, {}, {}

RegisterNUICallback('togglePlay', function(data, cb)
    if not currentSounds[invokingResource] then
        print('No sound playing')
        return cb('ok')
    end
    currentSounds[invokingResource].playing = data.playing
    if currentSounds[invokingResource].playing then
        if audioplayerHandlers[invokingResource].onResume then
            audioplayerHandlers[invokingResource].onResume(currentSounds[invokingResource])
        end
        TriggerServerEvent('mx-audioplayer:resume', currentSounds[invokingResource].soundId)
    else
        if audioplayerHandlers[invokingResource].onPause then
            audioplayerHandlers[invokingResource].onPause(currentSounds[invokingResource])
        end
        TriggerServerEvent('mx-audioplayer:stop', currentSounds[invokingResource].soundId)
    end
    cb('ok')
end)

RegisterNUICallback('getSoundData', function(data, cb)
    local url = data.url
    local info = exports['mx-surround']:getInfoFromUrl(url)
    cb(info)
end)

RegisterNUICallback('setPlaylist', function(data, cb)
    playlist = data.playlist
    SetResourceKvp('audioplayer_playlist_' .. (invokingResource or ''), json.encode(playlist))
    cb('ok')
end)

---@param handlers? {onPlay: function, onPause: function, onResume: function, onVolumeChange: function, onSeek: function, onClose: function}
local function openUi(handlers)
    if not handlers then handlers = {} end
    invokingResource = GetInvokingResource() or ''
    local _playlist = GetResourceKvpString('audioplayer_playlist_' .. (invokingResource))
    SetNuiFocus(true, true)
    _playlist = _playlist and json.decode(_playlist) or {}
    if currentSounds[invokingResource] then
        for k, v in pairs(_playlist) do
            if v.id == currentSounds[invokingResource].id then
                _playlist[k].duration = math.floor(currentSounds[invokingResource].duration)
                break
            end
        end
    end
    SendNUIMessage({
        action = 'open',
        data = {
            playlist = _playlist,
            currentSound = currentSounds[invokingResource]
        }
    })
    audioplayerHandlers[invokingResource] = handlers
end

exports('open', openUi)

RegisterCommand('ayo', function()
    openUi()
end, false)

local function onTimeUpdate(soundData)
    SendNUIMessage({
        action = 'timeUpdate',
        data = {
            time = math.floor(soundData.currentTime),
        }
    })
end

RegisterNUICallback('play', function(data, cb)
    local soundData = data.soundData
    if not soundData then
        print('No sound data')
        return cb(false)
    end
    local url = soundData.url
    local soundId = soundData.soundId
    local volume = data.volume
    if currentSounds[invokingResource] and currentSounds[invokingResource].soundId ~= soundId then
        TriggerServerEvent('mx-audioplayer:destroy', currentSounds[invokingResource].soundId)
    end
    TriggerServerEvent('mx-audioplayer:play', url, soundId, volume, invokingResource)
    local loaded = exports['mx-surround']:soundIsLoaded(soundId) -- wait for the sound to load
    if not loaded then return cb(false) end                      -- if it doesn't load, return false
    local maxDuration = exports['mx-surround']:getMaxDuration(soundId)
    soundData.duration = maxDuration
    soundData.playing = true
    currentSounds[invokingResource] = soundData
    if audioplayerHandlers[invokingResource].onPlay then
        audioplayerHandlers[invokingResource].onPlay(currentSounds[invokingResource])
    end
    exports['mx-surround']:onTimeUpdate(soundId, onTimeUpdate)
    cb(maxDuration)
end)

RegisterNUICallback('setVolume', function(data, cb)
    if not currentSounds[invokingResource] then return cb(0) end
    TriggerServerEvent('mx-audioplayer:setVolume', currentSounds[invokingResource].soundId, data.volume)
    if audioplayerHandlers[invokingResource].onVolumeChange then
        audioplayerHandlers[invokingResource].onVolumeChange(currentSounds[invokingResource])
    end
    cb('ok')
end)

RegisterNUICallback('seek', function(data, cb)
    if not currentSounds[invokingResource] then return cb(0) end
    TriggerServerEvent('mx-audioplayer:seek', currentSounds[invokingResource].soundId, data.position)
    if audioplayerHandlers[invokingResource].onSeek then
        audioplayerHandlers[invokingResource].onSeek(currentSounds[invokingResource])
    end
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)
    if audioplayerHandlers[invokingResource].onClose then
        audioplayerHandlers[invokingResource].onClose(currentSounds[invokingResource])
    end
    cb('ok')
end)
