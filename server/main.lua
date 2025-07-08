while not Version do Wait(0) end
local versionCheck = Version.checkScriptVersion('mx-surround', '2.4.8')
if not versionCheck then return end

-- Audioplayer list for each id
AudioPlayerAccounts = {} ---@type AudioplayerAccount[]

local tokens = {} ---@type table<string, {username: string, password: number}>

local Surround = exports['mx-surround']

---@param src number
---@param msg string
function Notification(src, msg)
    TriggerClientEvent('mx-audioplayer:notification', src, msg)
end

---@return string
local function generateToken()
    local chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    local token, length, charLength = '', 8, #chars
    for i = 1, length do
        local randomIndex = math.random(1, charLength)
        token = token .. string.sub(chars, randomIndex, randomIndex)
    end
    if tokens[token] then
        Wait(0)
        return generateToken()
    end
    return token
end

RegisterNetEvent('mx-audioplayer:play', function(id, url, soundId, soundData, volume, playQuietly, coords, customData)
    local src = source
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:play ::: User not found', id)
        return
    end
    if user.player?.soundId then
        Surround:Destroy(-1, user.player.soundId)
        user.player.soundId = nil
        Debug('mx-audioplayer:play ::: Destroying previous sound', user.player.soundId)
    end
    volume = playQuietly and 0.0 or volume
    Surround:Play(-1, soundId, url, coords, false, volume, customData.panner)
    if customData.maxDistance then
        Surround:setMaxDistance(-1, soundId, customData.maxDistance)
    end
    if not soundId then return print('Failed to play sound') end
    Surround:setDestroyOnFinish(-1, soundId, false)
    user.player = {
        id = id,
        soundId = soundId,
        source = src,
        soundData = soundData
    }
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
    for k, v in pairs(AudioPlayerAccounts) do
        if not v.player then goto continue end
        if v.player.source == src then
            Surround:Destroy(-1, v)
            v.player = nil
            Debug('Player dropped', src, v.player.soundId)
        end
        ::continue::
    end
end)

RegisterNetEvent('mx-audioplayer:setVolume', function(id, soundId, volume)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:setVolume ::: User not found', id)
        return
    end
    user.player.soundData.volume = volume
    Debug('mx-audioplayer:setVolume', soundId, volume)
    Surround:setVolumeMax(-1, soundId, volume)
end)

RegisterNetEvent('mx-audioplayer:seek', function(soundId, position)
    Surround:setTimeStamp(-1, soundId, position)
end)

RegisterNetEvent('mx-audioplayer:resume', function(id, soundId)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:resume ::: User not found', id)
        return
    end
    Surround:Resume(-1, soundId)
    user.player.soundData.playing = true
end)

RegisterNetEvent('mx-audioplayer:pause', function(id, soundId)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:pause ::: User not found', id)
        return
    end
    user.player.soundData.playing = false
    Surround:Pause(-1, soundId)
end)

RegisterNetEvent('mx-audioplayer:destroy', function(id, soundId)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:destroy ::: User not found', id)
        return
    end
    if user.player.soundId ~= soundId then
        Debug('mx-audioplayer:destroy ::: SoundId not found', soundId, user.player.soundId)
        return
    end
    user.player = nil
    Surround:Destroy(-1, soundId)
    Debug('mx-audioplayer:destroy', soundId, user.player.soundId)
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

---@param src number
---@param user Account | nil
local function userDboToDto(src, user)
    if not user then return end
    local identifier = GetIdentifier(src)
    user.isOwner = true
    if identifier ~= user.creator then
        user.creator = nil
        user.password = nil
        user.id = nil
        user.isOwner = false
    end
    return user
end

---@param source number
---@param id string Audioplayer identifier, so we can sync the same audioplayer between clients
---@param data LoginData
---@return false | string
lib.callback.register('mx-audioplayer:login', function(source, id, data)
    local src = source
    local username, password = data.username, data.password
    if data.token then
        local token = tokens[data.token]
        if not token then
            Debug('mx-audioplayer:login ::: Token not found', data.token)
            return false
        end
        username, password = token.username, token.password
    end
    assert(username, 'Username is required')
    assert(password, 'Password is required')
    assert(type(password) == 'number', 'Password need to be number but its not a number, probably this player trying to avoid hash. Source: ' .. src)
    local user = db.getUser(username, password)
    if not user then
        return false
    end
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = { id = id, accountId = user.id }
    local playlist = db.getPlaylist(user.id)
    user = userDboToDto(src, user)
    TriggerClientEvent('mx-audioplayer:login', src, playlist, user)
    Debug('mx-audioplayer:login', user)
    if not data.token then
        data.token = generateToken()
        Debug('mx-audioplayer:login ::: Generated token', data.token)
        tokens[data.token] = {
            username = username,
            password = password
        }
    end
    return data.token
end)

lib.callback.register('mx-audioplayer:logout', function(source, id)
    local src = source
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:logout ::: User not found', id)
        return false
    end
    AudioPlayerAccounts = table.filter(AudioPlayerAccounts, function(v) return v.id ~= id end)
    Debug('mx-audioplayer:logout', user.accountId)
    return true
end)

---@param source number
---@param id string Audioplayer identifier, so we can sync the same audioplayer between clients
---@param username string
---@param password string
---@param firstname string
---@param lastname string
---@return boolean
lib.callback.register('mx-audioplayer:register', function(source, id, username, password, firstname, lastname)
    local src = source
    local identifier = GetIdentifier(src)
    if not identifier then
        Error('Failed to get identifier')
        return false
    end
    local userId = db.insertUser(username, joaat(password), firstname, lastname, identifier)
    if not userId then
        Notification(src, 'We could not create an account with this username and password.')
        return false
    end
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = { id = id, accountId = userId }
    Debug('Account', userId, 'registered')
    return true
end)

local profileSecuredParams = {
    username = true,
    password = true,
    avatar = true,
}

---@param source number
---@param id string Audioplayer identifier, so we can sync the same audioplayer between clients
---@param data UpdateProfile
---@return boolean
lib.callback.register('mx-audioplayer:updateProfile', function(source, id, data)
    local src = source
    if not data then
        Debug('mx-audioplayer:updateProfile :: data is nil')
        return false
    end
    if not data.username or not data.password then
        Debug('mx-audioplayer:updateProfile :: data is empty', data)
        return false
    end
    local identifier = GetIdentifier(src)
    if not identifier then
        Error('Failed to get identifier')
        return false
    end
    local unsecured = table.find(data, function(k, v)
        return not profileSecuredParams[v]
    end)
    if unsecured then
        Notification(src, 'You are trying to exploit update profile event.')
        Debug('mx-audioplayer:updateProfile', 'User trying to exploit update profile event', src, data)
        return false
    end
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:updateProfile ::: User not found', id)
        return false
    end
    data.password = joaat(data.password)
    local success = db.updateUser(identifier, user, data)
    Debug('mx-audioplayer:updateProfile', user.accountId, data)
    return success and true or false
end)

---@param source number
---@param id string
---@return {playlist?: table, user?: Account, player: Player}
lib.callback.register('mx-audioplayer:getData', function(source, id)
    local src = source
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:getData ::: User not found', id)
        return { playlist = nil, user = nil }
    end
    local userData = db.getUserById(user.accountId)
    userData = userDboToDto(src, userData)
    local playlist = db.getPlaylist(user.accountId)
    Debug('mx-audioplayer:getData', user.accountId, userData)
    return {
        playlist = playlist,
        user = userData,
        player = user.player
    }
end)

---@param id string
---@param playlist table
RegisterNetEvent('mx-audioplayer:setPlaylist', function(id, playlist)
    local src = source
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:setPlaylist ::: User not found', id)
        return
    end
    db.setPlaylist(user.accountId, playlist)
    Debug('mx-audioplayer:setPlaylist', user.accountId, playlist)
end)
