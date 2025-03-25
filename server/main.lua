while not Version do Wait(0) end
local success = Version.checkScriptVersion('mx-surround', '2.4.8')
if not success then return end

-- Audioplayer list for each id
AudioPlayerAccounts = {} ---@type AudioplayerAccount[]

local Surround = exports['mx-surround']
local sounds = {}

---@param src number
---@param msg string
function Notification(src, msg)
    TriggerClientEvent('mx-audioplayer:notification', src, msg)
end

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
    local src = source
    disabledUis[customId] = {
        src = src,
        disabled = disabled
    }
    TriggerClientEvent('mx-audioplayer:disableUi', -1, src, customId, disabled)
end)

lib.callback.register('mx-audioplayer:isUiDisabled', function(source, customId)
    if not disabledUis[customId] then return false end
    return disabledUis[customId].src ~= source and disabledUis[customId].disabled
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

RegisterNetEvent('mx-audioplayer:pause', function(soundId)
    Surround:Pause(-1, soundId)
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

---@param source number
---@param id string Audioplayer identifier, so we can sync the same audioplayer between clients
---@param username string
---@param password string
---@return boolean
lib.callback.register('mx-audioplayer:login', function(source, id, username, password)
    local src = source
    local userId = db.getUserId(username, joaat(password))
    if not userId then
        Notification(src, 'There is no account with this username and password.')
        return false
    end
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = { id = id, accountId = userId }
    Debug('Account', userId, 'logged in')
    return true
end)

---@param source number
---@param id string Audioplayer identifier, so we can sync the same audioplayer between clients
---@param username string
---@param password string
---@return boolean
lib.callback.register('mx-audioplayer:register', function(source, id, username, password)
    local src = source
    local identifier = GetIdentifier(src)
    if not identifier then
        Error('Failed to get identifier')
        return false
    end
    local userId = db.insertUser(username, joaat(password), identifier)
    if not userId then
        Notification(src, 'We could not create an account with this username and password.')
        return false
    end
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = { id = id, accountId = userId }
    Debug('Account', userId, 'registered')
    return true
end)

---@param source number
---@param id string
---@return nil | Playlist[] If returns nil then the account is not logged in
lib.callback.register('mx-audioplayer:getPlaylist', function(source, id)
    local src = source
    local accountId = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not accountId then return end
    local playlist = db.getPlaylist(accountId)
    return playlist or {}
end)
