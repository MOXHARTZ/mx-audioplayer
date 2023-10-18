local sounds = {}

RegisterNetEvent('mx-audioplayer:play', function(url, soundId, volume, invokingResource)
    local src = source
    local id = src
    if invokingResource then id = id .. ':' .. invokingResource end
    local player = GetPlayerPed(src)
    local playerCoords = GetEntityCoords(player)
    exports['mx-surround']:Play(-1, soundId, url, playerCoords, false, volume)
    if not soundId then return print('Failed to play sound') end
    exports['mx-surround']:setDestroyOnFinish(-1, soundId, false)
    sounds[id] = soundId
end)

AddEventHandler('playerDropped', function()
    local src = source
    for k, v in pairs(sounds) do
        if k:find(src) then
            exports['mx-surround']:Destroy(-1, v)
            sounds[k] = nil
        end
    end
end)

RegisterNetEvent('mx-audioplayer:setVolume', function(soundId, volume)
    exports['mx-surround']:setVolumeMax(-1, soundId, volume)
end)

RegisterNetEvent('mx-audioplayer:seek', function(soundId, position)
    exports['mx-surround']:setTimeStamp(-1, soundId, position)
end)

RegisterNetEvent('mx-audioplayer:resume', function(soundId)
    exports['mx-surround']:Resume(-1, soundId)
end)

RegisterNetEvent('mx-audioplayer:stop', function(soundId)
    exports['mx-surround']:Stop(-1, soundId)
end)
