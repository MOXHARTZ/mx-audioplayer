while not Version do Wait(0) end
local success = Version.checkScriptVersion('mx-surround', '1.9.0')
if not success then return end

local Surround = exports['mx-surround']
local sounds = {}

local function checkCustomIdExist(customId)
    for k, v in pairs(sounds) do
        local id, res, custom = k:match('(.*):(.*):(.*)')
        if custom == customId then return k end
    end
    return false
end

RegisterNetEvent('mx-audioplayer:play', function(url, soundId, volume, invokingResource, customId, playQuietly, coords, customData)
    local src = source
    local id = src
    if invokingResource then id = id .. ':' .. invokingResource end
    if customId then id = id .. ':' .. customId end
    local currentSound = checkCustomIdExist(customId)
    if currentSound then
        Surround:Destroy(-1, sounds[currentSound])
        sounds[currentSound] = nil
    end
    volume = playQuietly and 0.0 or volume
    Surround:Play(-1, soundId, url, coords, false, volume, customData.panner)
    if not soundId then return print('Failed to play sound') end
    Surround:setDestroyOnFinish(-1, soundId, false)
    sounds[id] = soundId
end)

local disabledUis = {}
RegisterNetEvent('mx-audioplayer:disableUi', function(customId, disabled)
    disabledUis[customId] = disabled
end)

lib.callback.register('mx-audioplayer:isUiDisabled', function(source, customId)
    return disabledUis[customId]
end)

AddEventHandler('playerDropped', function()
    local src = source
    for k, v in pairs(sounds) do
        local id, res, custom = k:match('(.*):(.*):(.*)')
        id = tonumber(id)
        src = tonumber(src)
        if id == src then
            Surround:Destroy(-1, v)
            sounds[k] = nil
        end
    end
end)

RegisterNetEvent('mx-audioplayer:setVolume', function(soundId, volume)
    Surround:setVolumeMax(-1, soundId, volume)
end)

RegisterNetEvent('mx-audioplayer:seek', function(soundId, position)
    Surround:setTimeStamp(-1, soundId, position)
end)

RegisterNetEvent('mx-audioplayer:resume', function(soundId)
    Surround:Resume(-1, soundId)
end)

RegisterNetEvent('mx-audioplayer:stop', function(soundId)
    Surround:Stop(-1, soundId)
end)

RegisterNetEvent('mx-audioplayer:destroy', function(soundId)
    Surround:Destroy(-1, soundId)
end)

RegisterNetEvent('mx-audioplayer:attach', function(soundId, netId, volume, isInVehicle)
    if not netId then return end
    exports['mx-surround']:attachEntity(-1, soundId, netId)
    local wait = isInVehicle and 0 or 200
    Wait(wait)
    exports['mx-surround']:setVolumeMax(-1, soundId, volume)
end)

function InitPlayersName(players)
    for k, v in pairs(players) do
        local firstName, lastName = GetCharacterName(v.source)
        if not firstName or not lastName then
            firstName, lastName = '', ''
        end
        players[k].name = firstName .. ' ' .. lastName
    end
    return players
end

lib.callback.register('mx-audioplayer:getNearbyPlayers', function(source)
    local player = GetPlayerPed(source)
    local playerCoords = GetEntityCoords(player)
    local players = {}
    for _, v in pairs(GetPlayers()) do
        local target = GetPlayerPed(v)
        local targetCoords = GetEntityCoords(target)
        local distance = #(playerCoords - targetCoords)
        if distance < 10.0 and tonumber(v) ~= tonumber(source) then
            table.insert(players, { source = v, distance = distance })
        end
    end
    table.sort(players, function(a, b) return a.distance < b.distance end)
    players = InitPlayersName(players)
    return players
end)

if Config.Boombox.Item then
    RegisterUsableItem(Config.Boombox.Item, function(source)
        RemoveItem(source, Config.Boombox.Item, 1)
        TriggerClientEvent('mx-audioplayer:boombox:create', source)
    end)

    RegisterNetEvent('mx-audioplayer:boombox:destroy', function()
        local src = source
        local item = Config.Boombox.Item
        AddItem(src, item, 1)
    end)
end

RegisterNetEvent('mx-audioplayer:sharePlaylist', function(playlist, player)
    local src = source
    local senderName, senderLastname = GetCharacterName(src)
    if not senderName or not senderLastname then
        senderName, senderLastname = '', ''
    end
    senderName = senderName .. ' ' .. senderLastname
    Debug('Received playlist from', senderName, 'to', player)
    TriggerClientEvent('mx-audioplayer:receivePlaylist', player, playlist, senderName)
end)
