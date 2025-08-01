while not Version do Wait(0) end
local versionCheck = Version.checkScriptVersion('mx-surround', '3.0.0')
if not versionCheck then return end

-- Audioplayer list for each id
AudioPlayerAccounts = {} ---@type AudioplayerAccount[]

local tokens = {} ---@type table<string, {username: string, password: number}>
local Surround = exports['mx-surround']

---@param src number
---@param msg string
---@param type 'info' | 'error' | 'success'
function Notification(src, msg, type)
    TriggerClientEvent('mx-audioplayer:notification', src, msg, type)
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

---@param playlist PlaylistData[]
---@param soundId string
---@return {playlistIndex: number, songIndex: number, playlistId: string, songId: string} | nil
local function getPlaylistSound(playlist, soundId)
    for i, v in pairs(playlist) do
        for j, w in pairs(v.songs) do
            if w.soundId == soundId then
                return {
                    playlistIndex = i,
                    songIndex = j,
                    playlistId = v.id,
                    songId = w.id,
                }
            end
        end
    end
    return nil
end

---@class PlaySound
---@field soundId string -- soundData.soundId combines with `id` to make a real unique id for each player.
---@field soundData PlaylistSong
---@field coords vector3
---@field options AudioPlayerOptions
---@field netId? number

-- Clarification:
-- soundId is the id of the sound that is being played.
-- `soundData.soundId` is the REAL id of the sound that is being played.
-- The difference is the soundId is the id is `soundId` combines with `id` to make a real unique id for each player.
-- Otherwise, if we use only `soundId`, the sound will be overwrite when a account use multiple audioplayers.
-- NOTE: this need to be change in the future, its too complex to understand. And hard to maintain.

---@param source number
---@param id string
---@param data PlaySound
---@return Player | false
local function playSound(source, id, data)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:play ::: User not found', id)
        return false
    end
    local options, soundId = data.options or {}, data.soundId
    if user.player?.soundId then
        Surround:Destroy(-1, user.player.soundId)
        user.player.soundId = nil
    end

    local volume = options.silent and 0.0 or (user.player.volume or 1)

    local playlist = db.getPlaylist(user.accountId)
    assert(playlist, 'mx-audioplayer:play ::: Playlist not found', user.accountId)

    local soundData = getPlaylistSound(playlist, data.soundData.soundId)
    assert(soundData, 'mx-audioplayer:play ::: Sound not found', data.soundData.soundId, playlist)

    if not data.soundData.url then
        -- first param is the query, second param is the limit
        local response = Surround:searchTrack(data.soundData.title .. ' - ' .. data.soundData.artist, 1)
        if not response then
            Error('mx-audioplayer:play ::: Failed to search track', data.soundData.title .. ' - ' .. data.soundData.artist)
            return false
        end
        local url = 'https://www.youtube.com/watch?v=' .. response[1].videoId
        playlist[soundData.playlistIndex].songs[soundData.songIndex].url = url
        data.soundData.url = url
        db.setPlaylist(user.accountId, playlist)
        TriggerClientEvent('mx-audioplayer:setPlaylist', source, playlist)
    end

    local success = Surround:Play(-1, soundId, data.soundData.url, data.coords, false, volume, options.panner)
    if not success then
        return false
    end

    if data.netId then
        Surround:attachEntity(-1, soundId, data.netId)
    end

    Surround:onDestroy(soundId, function()
        if not DoesPlayerExist(source) then return Debug('mx-audioplayer:destroy ::: Player not found', source) end
        TriggerClientEvent('mx-audioplayer:destroy', source, id)
        Debug('mx-audioplayer:play ::: Sound destroyed', data.soundId)
    end)

    Surround:onPlayEnd(soundId, function()
        if not DoesPlayerExist(source) then return Debug('mx-audioplayer:playEnd ::: Player not found', source) end

        -- fetch again, because player can change the playlist.
        local playlist = db.getPlaylist(user.accountId)
        if not playlist then
            return Debug('mx-audioplayer:playEnd ::: Playlist not found', user.accountId)
        end
        local soundData = getPlaylistSound(playlist, data.soundData.soundId)
        if not soundData then
            return Debug('mx-audioplayer:playEnd ::: Sound not found', data.soundData.soundId, playlist)
        end
        local playlistData = playlist[soundData.playlistIndex]
        if soundData.songIndex == #playlistData.songs then
            soundData.songIndex = 1
        else
            soundData.songIndex = soundData.songIndex + 1
        end
        local nextSound = playlistData.songs[soundData.songIndex]
        if nextSound then
            local netId = Surround:getSoundNetId(soundId)
            TriggerClientEvent('mx-audioplayer:setWaitingForResponse', source, id, true)
            options.silent = false
            playSound(source, id, {
                soundId = nextSound.soundId .. id,
                soundData = nextSound,
                coords = data.coords,
                options = options,
                netId = netId
            })
            TriggerClientEvent('mx-audioplayer:setWaitingForResponse', source, id, false)
        end
    end)
    if options.maxDistance then
        Surround:setMaxDistance(-1, soundId, options.maxDistance)
    end
    Surround:setDestroyOnFinish(-1, soundId, false)

    user.player = {
        id = id,
        soundId = soundId,
        source = source,
        soundData = data.soundData,
        playing = true,
        duration = 0
    }

    TriggerClientEvent('mx-audioplayer:playSound', source, user.player)
    return user.player
end

---@param source number
---@param data PlaySound
---@return Player | false
lib.callback.register('mx-audioplayer:play', function(source, id, data)
    return playSound(source, id, data)
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
            Surround:Destroy(-1, v.player.soundId)
            Debug('Player dropped we destroyed the sound', src, v.player.soundId)
            v.player = nil
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
    user.player.volume = volume
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
    user.player.playing = true
end)

RegisterNetEvent('mx-audioplayer:pause', function(id, soundId)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:pause ::: User not found', id)
        return
    end
    user.player.playing = false
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
end)

RegisterNetEvent('mx-audioplayer:attach', function(soundId, netId, volume, isInVehicle)
    if not netId then return end
    exports['mx-surround']:attachEntity(-1, soundId, netId)
    local wait = isInVehicle and 0 or 200
    Wait(wait)
    exports['mx-surround']:setVolumeMax(-1, soundId, volume or 1)
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
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = {
        id = id,
        accountId = user.id,
        player = {
            playing = false,
            volume = 1,
        }
    }
    user = userDboToDto(src, user)
    if not data.token then
        data.token = generateToken()
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
    if user.player then
        Surround:Destroy(-1, user.player.soundId)
        user.player = nil
    end
    AudioPlayerAccounts = table.filter(AudioPlayerAccounts, function(v) return v.id ~= id end)
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
        Notification(src, 'We could not create an account with this username and password.', 'error')
        return false
    end
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = { id = id, accountId = userId }
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
        Notification(src, 'You are trying to exploit update profile event.', 'error')
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
---@return {playlist?: table, user?: Account, player: Player} | nil
lib.callback.register('mx-audioplayer:getData', function(source, id)
    local src = source
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        return nil
    end
    local userData = db.getUserById(user.accountId)
    userData = userDboToDto(src, userData)
    local playlist = db.getPlaylist(user.accountId)
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
end)
