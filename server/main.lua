local Surround = exports['mx-surround']
local callback = Surround:callback()
local sounds = {}

local function checkCustomIdExist(customId)
    for k, v in pairs(sounds) do
        local id, res, custom = k:match('(.*):(.*):(.*)')
        if custom == customId then return k end
    end
    return false
end

RegisterNetEvent('mx-audioplayer:play', function(url, soundId, volume, invokingResource, customId)
    local src = source
    local id = src
    if invokingResource then id = id .. ':' .. invokingResource end
    if customId then id = id .. ':' .. customId end
    local currentSound = checkCustomIdExist(customId)
    if currentSound then
        exports['mx-surround']:Destroy(-1, sounds[currentSound])
        sounds[currentSound] = nil
    end
    local player = GetPlayerPed(src)
    local playerCoords = GetEntityCoords(player)
    exports['mx-surround']:Play(-1, soundId, url, playerCoords, false, volume)
    if not soundId then return print('Failed to play sound') end
    exports['mx-surround']:setDestroyOnFinish(-1, soundId, false)
    sounds[id] = soundId
end)

local disabledUis = {}
RegisterNetEvent('mx-audioplayer:disableUi', function(customId, disabled)
    disabledUis[customId] = disabled
end)

callback.register('mx-audioplayer:isUiDisabled', function(source, customId)
    return disabledUis[customId]
end)

AddEventHandler('playerDropped', function()
    local src = source
    for k, v in pairs(sounds) do
        local id, res, custom = k:match('(.*):(.*):(.*)')
        id = tonumber(id)
        src = tonumber(src)
        if id == src then
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

RegisterNetEvent('mx-audioplayer:destroy', function(soundId)
    exports['mx-surround']:Destroy(-1, soundId)
end)
