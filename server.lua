local sounds = {}

RegisterNetEvent('mx-boombox:play', function(url, soundId, netId, volume)
    local src = source
    if not netId then return end
    if sounds[src] then
        -- Destroy the previous sound
        exports['mx-surround']:Destroy(-1, sounds[src])
    end
    local player = GetPlayerPed(src)
    local playerCoords = GetEntityCoords(player)
    -- Play the new sound
    exports['mx-surround']:Play(-1, soundId, url, playerCoords, false, volume)
    -- Check if the sound was created
    if not soundId then return print('Failed to play sound') end
    -- Attach the sound to the player for everyone
    exports['mx-surround']:attachEntity(-1, soundId, netId)
    exports['mx-surround']:setDestroyOnFinish(-1, soundId, false)
    sounds[src] = soundId
end)

AddEventHandler('playerDropped', function()
    local src = source
    if sounds[src] then
        exports['mx-surround']:Destroy(-1, sounds[src])
    end
    sounds[src] = nil
end)

RegisterNetEvent('mx-boombox:setVolume', function(soundId, volume)
    exports['mx-surround']:setVolumeMax(-1, soundId, volume)
end)

RegisterNetEvent('mx-boombox:seek', function(soundId, position)
    exports['mx-surround']:setTimeStamp(-1, soundId, position)
end)

RegisterNetEvent('mx-boombox:resume', function(soundId)
    exports['mx-surround']:Resume(-1, soundId)
end)

RegisterNetEvent('mx-boombox:pause', function(soundId)
    exports['mx-surround']:Pause(-1, soundId)
end)
