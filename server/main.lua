while not Version do Wait(0) end
local versionCheck = Version.checkScriptVersion('mx-surround', '4.1.0')
if not versionCheck then return end

AudioPlayerAccounts = {}

local TOKENS_KVP <const> = 'mx-audioplayer:tokens'
local tokens = {}
local Sound = exports['mx-surround']

---@param location table
---@return table | nil
local function buildSpaceOverrides(location)
    local overrides

    local function set(key, value)
        if value == nil then return end
        overrides = overrides or {}
        overrides[key] = value
    end

    set('fillsSpace', location.fillsSpace)
    set('leakDistance', location.leakDistance)
    set('rolloff', location.rolloff)

    if location.emitters then
        set('emitters', location.emitters)
    elseif location.emitterCount or location.emitterRadius or location.emitterHeight then
        set('emitters', {
            count = location.emitterCount,
            radius = location.emitterRadius,
            height = location.emitterHeight,
            heading = location.emitterHeading,
        })
    end

    return overrides
end

---@param soundId string
---@param locationId? string
function ApplyLocationSpace(soundId, locationId)
    if not locationId then return end
    if not Config.DJ?.Locations then return end

    local location = table.find(Config.DJ.Locations, function(v) return v.id == locationId end)
    if not location then return end

    if location.stereo ~= nil then
        Sound:setStereoMode(-1, soundId, location.stereo)
    end

    local overrides = buildSpaceOverrides(location)
    if not location.space and not overrides then return end

    Sound:setSpacePreset(-1, soundId, location.space, overrides)
end

local function saveTokens()
    SetResourceKvp(TOKENS_KVP, json.encode(tokens))
end

local function loadTokens()
    local raw = GetResourceKvpString(TOKENS_KVP)
    if not raw then return end
    local ok, decoded = pcall(json.decode, raw)
    if ok and type(decoded) == 'table' then
        tokens = decoded
    end
end

loadTokens()

---@param accountId number
function InvalidateTokensForUser(accountId)
    local changed = false
    for token, entry in pairs(tokens) do
        if entry.userId == accountId then
            tokens[token] = nil
            changed = true
        end
    end
    if changed then saveTokens() end
end

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

---@class PlaySound
---@field soundId string -- soundData.soundId combines with `id` to make a real unique id for each player.
---@field soundData PlaylistSong
---@field coords vector3
---@field options AudioPlayerOptions
---@field netId? number

local resolvedStations = {}

---@param station table
---@return string|nil url, string|nil cover
local function searchStation(station)
    if not station.query then return nil end
    local cached = resolvedStations[station.id]
    if cached then return cached.url, cached.cover end

    local response = Sound:searchTrack(station.query, 1)
    local hit = response and response[1]
    if not hit or not hit.videoId then
        Error('mx-audioplayer:station ::: search found nothing for', station.id, station.query)
        return nil
    end

    local resolved = {
        url = 'https://www.youtube.com/watch?v=' .. hit.videoId,
        cover = hit.thumbnails and hit.thumbnails[#hit.thumbnails]?.url or nil,
    }
    resolvedStations[station.id] = resolved
    Debug('mx-audioplayer:station ::: resolved', station.id, resolved.url)
    return resolved.url, resolved.cover
end

---@param soundId string station id as it appears in Config.Stations.List
---@return table|nil
local function findStation(soundId)
    return table.find(Config.Stations.List, function(v) return v.id == soundId end)
end

---@param source number
---@param id string
---@param data PlaySound
---@return Player | false, string | nil
local function playSound(source, id, data)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:play ::: User not found', id)
        return false, 'play_account_not_found'
    end

    user.player = user.player or { playing = false, volume = 1 }

    local options, soundId = data.options or {}, data.soundId
    if user.player.soundId then
        Sound:Destroy(-1, user.player.soundId)
        user.player.soundId = nil
    end

    local volume = options.silent and 0.0 or (user.player.volume or 1)

    local playlist = db.getPlaylist(user.accountId)
    assert(playlist, 'mx-audioplayer:play ::: Playlist not found')

    if data.playlistId then
        user.player.currentPlaylistId = data.playlistId
    end

    if not user.player.currentPlaylistId then
        Debug('mx-audioplayer:play ::: Current playlist id not found', user.accountId)
        return false, 'play_playlist_not_selected'
    end

    local station
    if data.soundData.isStream then
        station = findStation(data.soundData.soundId)
        if not station then
            Debug('mx-audioplayer:play ::: unknown station', data.soundData.soundId)
            return false, 'play_failed'
        end
        local cachedUrl, cachedCover = nil, nil
        if resolvedStations[station.id] then
            cachedUrl, cachedCover = resolvedStations[station.id].url, resolvedStations[station.id].cover
        end
        data.soundData.url = station.url or cachedUrl
        data.soundData.cover = station.cover or cachedCover or data.soundData.cover
        if not data.soundData.url then
            local url, cover = searchStation(station)
            if not url then return false, 'play_track_search_failed' end
            data.soundData.url = url
            data.soundData.cover = station.cover or cover or data.soundData.cover
        end
    end

    if not data.soundData.url and not data.soundData.isStream then
        local currentPlaylist, currentPlaylistIndex = table.find(playlist, function(v) return v.id == user.player.currentPlaylistId end)
        assert(currentPlaylist, 'mx-audioplayer:play ::: Current playlist not found')
        local soundData, soundIndex = table.find(currentPlaylist.songs, function(v) return v.soundId == data.soundData.soundId end)
        assert(soundData, 'mx-audioplayer:play ::: Sound not found')

        local response = Sound:searchTrack(data.soundData.title .. ' - ' .. data.soundData.artist, 1)
        if not response then
            Error('mx-audioplayer:play ::: Failed to search track', data.soundData.title .. ' - ' .. data.soundData.artist)
            return false, 'play_track_search_failed'
        end
        local url = 'https://www.youtube.com/watch?v=' .. response[1].videoId
        playlist[currentPlaylistIndex].songs[soundIndex].url = url
        data.soundData.url = url
        db.setPlaylist(user.accountId, playlist)
        TriggerClientEvent('mx-audioplayer:setPlaylist', source, playlist)
    end

    local success = Sound:Play(-1, soundId, data.soundData.url, data.coords, false, volume, options.panner)

    if not success and station and station.query then
        Warning('mx-audioplayer:station ::: pinned url failed, searching instead', station.id, data.soundData.url)
        resolvedStations[station.id] = nil
        local url, cover = searchStation(station)
        if url and url ~= data.soundData.url then
            data.soundData.url = url
            data.soundData.cover = station.cover or cover or data.soundData.cover
            success = Sound:Play(-1, soundId, url, data.coords, false, volume, options.panner)
        end
    end

    if not success then
        Error('mx-audioplayer:play ::: sound failed to start', data.soundData.title, data.soundData.url)
        return false, 'play_failed'
    end

    ApplyLocationSpace(soundId, data.options?.id)

    if data.netId then
        Sound:attachEntity(-1, soundId, data.netId)
    end

    Sound:onDestroy(soundId, function()
        local current = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
        if current and current.player and current.player.soundId and current.player.soundId ~= soundId then
            return Debug('mx-audioplayer:destroy ::: Sound replaced, skipping UI notify', soundId)
        end
        if not DoesPlayerExist(source) then return Debug('mx-audioplayer:destroy ::: Player not found', source) end
        TriggerClientEvent('mx-audioplayer:destroy', source, id)
        Debug('mx-audioplayer:play ::: Sound destroyed', data.soundId)
    end)

    Sound:onPlayEnd(soundId, function()
        OnPlayEnd(source, id, soundId)
    end)
    if options.maxDistance then
        Sound:setMaxDistance(-1, soundId, options.maxDistance)
    end
    Sound:setDestroyOnFinish(-1, soundId, false)

    user.player = {
        id = id,
        soundId = soundId,
        source = source,
        soundData = data.soundData,
        playing = true,
        duration = 0,
        currentPlaylistId = user.player?.currentPlaylistId,
        volume = user.player?.volume,
        repeatState = user.player?.repeatState,
        shuffle = user.player?.shuffle,
        queue = user.player?.queue,
        queueSeq = user.player?.queueSeq,
        playContext = { coords = data.coords, options = options },
    }

    TriggerClientEvent('mx-audioplayer:playSound', -1, user.player)
    return user.player
end

---@param id string
---@param queue QueueEntry[]
local function pushQueue(id, queue)
    TriggerClientEvent('mx-audioplayer:queue', -1, id, queue or {})
end

---@param player Player
---@return QueueEntry|nil
local function popQueue(player)
    local queue = player.queue
    if not queue or #queue == 0 then return nil end
    return table.remove(queue, 1)
end

---@param src number
---@param user AudioPlayerAccount
---@param data {op: string, soundId?: string, playlistId?: string, uid?: string, toIndex?: number}
function HandleQueueOp(src, user, data)
    if not Config.Queue.Enable or type(data) ~= 'table' then return end
    local player = user.player
    player.queue = player.queue or {}
    local queue = player.queue

    if data.op == 'clear' then
        player.queue = {}
    elseif data.op == 'remove' then
        for index, entry in ipairs(queue) do
            if entry.uid == data.uid then
                table.remove(queue, index)
                break
            end
        end
    elseif data.op == 'move' then
        local from
        for index, entry in ipairs(queue) do
            if entry.uid == data.uid then
                from = index
                break
            end
        end
        local to = tonumber(data.toIndex)
        if not from or not to then return end
        to = math.max(1, math.min(#queue, math.floor(to)))
        table.insert(queue, to, table.remove(queue, from))
    elseif data.op == 'add' or data.op == 'addNext' then
        if #queue >= (Config.Queue.MaxSize or 50) then
            return Notification(src, _L('queue.full'), 'error')
        end
        local playlist = db.getPlaylist(user.accountId)
        if not playlist then return end
        local owner = table.find(playlist, function(v) return v.id == data.playlistId end)
        if not owner then return Debug('mx-audioplayer:queue ::: playlist not found', data.playlistId) end
        local song = table.find(owner.songs, function(v) return v.soundId == data.soundId end)
        if not song then return Debug('mx-audioplayer:queue ::: song not found', data.soundId) end

        player.queueSeq = (player.queueSeq or 0) + 1
        local entry = {
            uid = ('q%d'):format(player.queueSeq),
            song = song,
            playlistId = data.playlistId,
        }
        table.insert(queue, data.op == 'addNext' and 1 or #queue + 1, entry)
    else
        return Debug('mx-audioplayer:queue ::: unknown op', data.op)
    end

    pushQueue(user.id, player.queue)
end

---@param source string
---@param id string
---@param soundId string
---@param opts? {ignoreRepeat?: boolean}
---@return boolean advanced
function AdvanceTrack(source, id, soundId, opts)
    opts = opts or {}
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Error('mx-audioplayer:advance ::: User not found', id)
        return false
    end

    local player = user.player
    if not player then
        Error('mx-audioplayer:advance ::: Player not found', id)
        return false
    end

    if soundId and player.soundId ~= soundId then
        return Debug('mx-audioplayer:advance ::: stale soundId, ignoring', soundId, player.soundId) or false
    end

    if not DoesPlayerExist(source) then
        Debug('mx-audioplayer:advance ::: Player not found', source)
        return false
    end

    if player.soundData?.isStream or player.currentPlaylistId == Config.Stations.PlaylistId then
        Debug('mx-audioplayer:advance ::: stream, ignoring auto advance', soundId)
        return false
    end

    if player.repeatState and not opts.ignoreRepeat then
        Sound:setTimeStamp(-1, player.soundId, 0)
        Debug('mx-audioplayer:advance ::: Repeat state is true, set time to 0', soundId)
        return true
    end

    local context = player.playContext or {}
    local options = type(context.options) == 'table' and context.options or {}
    options.silent = false

    local nextSound, nextPlaylistId

    local entry = Config.Queue.Enable and popQueue(player) or nil
    if entry then
        nextSound = entry.song
        nextPlaylistId = entry.playlistId or player.currentPlaylistId
    else
        local playlist = db.getPlaylist(user.accountId)
        if not playlist then
            Debug('mx-audioplayer:advance ::: Playlist not found', user.accountId)
            return false
        end

        if not player.currentPlaylistId then
            Debug('mx-audioplayer:advance ::: Current playlist id not found', user.accountId)
            return false
        end

        local currentPlaylist = table.find(playlist, function(v) return v.id == player.currentPlaylistId end)
        if not currentPlaylist then
            Debug('mx-audioplayer:advance ::: Current playlist not found', player.currentPlaylistId)
            return false
        end

        local soundData, soundIndex = table.find(currentPlaylist.songs, function(v) return v.soundId == player.soundData?.soundId end)
        if not soundData then
            Debug('mx-audioplayer:advance ::: Sound not found', player.soundData?.soundId, currentPlaylist)
            return false
        end

        if soundIndex == #currentPlaylist.songs then
            soundIndex = 1
        else
            soundIndex = soundIndex + 1
        end
        nextSound = currentPlaylist.songs[soundIndex]

        if player.shuffle and #currentPlaylist.songs > 2 then
            local finishedIndex = soundIndex == 1 and #currentPlaylist.songs or soundIndex - 1
            local newIndex = math.random(1, #currentPlaylist.songs - 1)
            if newIndex >= finishedIndex then
                newIndex = newIndex + 1
            end
            nextSound = currentPlaylist.songs[newIndex]
        end

        nextPlaylistId = player.currentPlaylistId
    end

    if not nextSound then return false end

    local netId = Sound:getSoundNetId(player.soundId)
    pushQueue(id, player.queue)
    TriggerClientEvent('mx-audioplayer:setWaitingForResponse', -1, id, true)
    playSound(source, id, {
        soundId = nextSound.soundId .. id,
        soundData = nextSound,
        coords = context.coords,
        options = options,
        netId = netId,
        playlistId = nextPlaylistId,
    })
    TriggerClientEvent('mx-audioplayer:setWaitingForResponse', -1, id, false)
    return true
end

---@param source string
---@param id string
---@param soundId string
function OnPlayEnd(source, id, soundId)
    AdvanceTrack(source, id, soundId)
end

lib.callback.register('mx-audioplayer:next', function(source, id, soundId)
    return AdvanceTrack(source, id, soundId, { ignoreRepeat = true })
end)

---@return Player | { error: string }
lib.callback.register('mx-audioplayer:play', function(source, id, data)
    local player, err = playSound(source, id, data)
    if not player then
        return { error = err or 'play_failed' }
    end
    return player
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
    local entry = disabledUis[customId]
    if not entry then return false end
    if entry.disabled and not DoesPlayerExist(entry.src) then
        disabledUis[customId] = nil
        TriggerClientEvent('mx-audioplayer:disableUi', -1, entry.src, customId, false)
        return false
    end
    return entry.src ~= source and entry.disabled
end)

AddEventHandler('playerDropped', function()
    local src = source

    for customId, entry in pairs(disabledUis) do
        if entry.src == src and entry.disabled then
            disabledUis[customId] = nil
            TriggerClientEvent('mx-audioplayer:disableUi', -1, src, customId, false)
        end
    end

    for _, v in pairs(AudioPlayerAccounts) do
        if not v.player or v.player.source ~= src then goto continue end

        if v.player.soundId then
            Sound:Destroy(-1, v.player.soundId)
            Debug('Player dropped we destroyed the sound', src, v.player.soundId)
        end

        v.player = {
            playing = false,
            volume = v.player.volume or 1,
            currentPlaylistId = v.player.currentPlaylistId,
            repeatState = v.player.repeatState,
            shuffle = v.player.shuffle,
        }

        ::continue::
    end
end)

---@param id string
---@param type 'volume' | 'seek' | 'playing' | 'repeat' | 'shuffle' | 'currentPlaylistId'
---@param data any
RegisterNetEvent('mx-audioplayer:sync', function(id, type, data)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        return Debug('mx-audioplayer:sync ::: User not found', {
            id = id,
            type = type,
            data = data
        })
    end

    user.player = user.player or { playing = false, volume = 1 }

    if type == 'volume' then
        user.player.volume = data.volume
        Sound:setVolumeMax(-1, data.soundId, data.volume)
    elseif type == 'seek' then
        if not user.player.playing then
            Sound:Resume(-1, data.soundId)
        end
        user.player.playing = true
        Sound:setTimeStamp(-1, data.soundId, data.position)
    elseif type == 'resume' then
        user.player.playing = true
        Sound:Resume(-1, data)
    elseif type == 'pause' then
        user.player.playing = false
        Sound:Pause(-1, data)
    elseif type == 'repeat' then
        user.player.repeatState = data == true
    elseif type == 'shuffle' then
        user.player.shuffle = data == true
    elseif type == 'queue' then
        HandleQueueOp(source, user, data)
    elseif type == 'currentPlaylistId' then
        user.player.currentPlaylistId = data
    elseif type == 'destroy' then
        if user.player?.soundId ~= data.soundId then
            return Debug('mx-audioplayer:sync ::: SoundId not found', data.soundId, user.player.soundId)
        end
        user.player.playing = false
        Sound:Destroy(-1, data.soundId)
        user.player.soundId = nil
        user.player.soundData = nil
    else
        Debug('mx-audioplayer:sync ::: type is not valid', type)
    end
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
        local firstName, lastName = GetCharacterName(tonumber(v.source) or v.source)
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

local pendingBoomboxPlacements = {}

if Config.Boombox.Item then
    RegisterUsableItem(Config.Boombox.Item, function(source)
        pendingBoomboxPlacements[source] = true
        RemoveItem(source, Config.Boombox.Item, 1)
        TriggerClientEvent('mx-audioplayer:boombox:create', source)
    end)

    RegisterNetEvent('mx-audioplayer:boombox:createSuccess', function()
        local src = source
        pendingBoomboxPlacements[src] = nil
    end)

    RegisterNetEvent('mx-audioplayer:boombox:createFailed', function()
        local src = source
        if not pendingBoomboxPlacements[src] then return end
        pendingBoomboxPlacements[src] = nil
        AddItem(src, Config.Boombox.Item, 1)
    end)

    RegisterNetEvent('mx-audioplayer:boombox:destroy', function()
        local src = source
        local item = Config.Boombox.Item
        AddItem(src, item, 1)
    end)
end

AddEventHandler('playerDropped', function()
    local src = source
    pendingBoomboxPlacements[src] = nil
end)

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
---@param id string AudioPlayer identifier, so we can sync the same audioplayer between clients
---@param data LoginData
---@return false | string
lib.callback.register('mx-audioplayer:login', function(source, id, data)
    local src = source
    local user

    if data.id then
        local identifier = GetIdentifier(src)
        if not identifier then
            Error('mx-audioplayer:login ::: Failed to get identifier')
            return false
        end
        user = db.getOwnedAccount(data.id, identifier)
        if not user then
            return false
        end
    elseif data.token then
        local entry = tokens[data.token]
        if not entry then
            return false
        end
        user = db.getUserById(entry.userId)
        if not user then
            tokens[data.token] = nil
            saveTokens()
            return false
        end
    else
        local username, password = data.username, data.password
        assert(username, 'Username is required')
        assert(password, 'Password is required')
        assert(type(password) == 'number', 'Password need to be number but its not a number, probably this player trying to avoid hash. Source: ' .. src)
        user = db.getUser(username, password)
        if not user then
            return false
        end
    end

    local existing = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    local preservedPlayer = existing?.player
    local sameAccount = existing?.accountId == user.id

    AudioPlayerAccounts = table.filter(AudioPlayerAccounts, function(v) return v.id ~= id end)
    AudioPlayerAccounts[#AudioPlayerAccounts + 1] = {
        id = id,
        creator = user.creator,
        accountId = user.id,
        player = {
            playing = false,
            volume = preservedPlayer?.volume or 1,
            currentPlaylistId = preservedPlayer?.currentPlaylistId,
            repeatState = preservedPlayer?.repeatState,
            shuffle = preservedPlayer?.shuffle,
            queue = sameAccount and preservedPlayer?.queue or {},
            queueSeq = sameAccount and preservedPlayer?.queueSeq or 0,
        }
    }
    if not data.token then
        data.token = generateToken()
    end
    tokens[data.token] = { userId = user.id }
    saveTokens()
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
        if user.player.soundId then
            Sound:Destroy(-1, user.player.soundId)
        end
        user.player.playing = false
    end
    AudioPlayerAccounts = table.filter(AudioPlayerAccounts, function(v) return v.id ~= id end)
    return true
end)

---@param source number
---@param id string AudioPlayer identifier, so we can sync the same audioplayer between clients
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
    return true
end)

local profileSecuredParams = {
    username = true,
    password = true,
    avatar = true,
}

---@param source number
---@param id string AudioPlayer identifier, so we can sync the same audioplayer between clients
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
local SyntheticPlaylistIds <const> = {
    [Config.Stations.PlaylistId] = true,
}

RegisterNetEvent('mx-audioplayer:setPlaylist', function(id, playlist)
    local src = source
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:setPlaylist ::: User not found', id)
        return
    end
    if type(playlist) == 'table' then
        playlist = table.filter(playlist, function(v) return not SyntheticPlaylistIds[v.id] end)
    end
    db.setPlaylist(user.accountId, playlist)
end)

lib.callback.register('mx-audioplayer:getUserAccounts', function(source)
    local identifier = GetIdentifier(source)
    if not identifier then
        Error('mx-audioplayer:getUserAccounts ::: Failed to get identifier')
        return false
    end
    return db.getUserAccounts(identifier)
end)

lib.callback.register('mx-audioplayer:hasAccess', function(source, id)
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        return true
    end
    local identifier = GetIdentifier(source)
    if not identifier then
        return false
    end
    return user.creator == identifier
end)

local SHARE_KVP <const> = 'mx-audioplayer:shareCodes'
local SHARE_ALPHABET <const> = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
local shareCodes = {}

local function saveShareCodes()
    SetResourceKvp(SHARE_KVP, json.encode(shareCodes))
end

local function loadShareCodes()
    local raw = GetResourceKvpString(SHARE_KVP)
    if not raw then return end
    local ok, decoded = pcall(json.decode, raw)
    if ok and type(decoded) == 'table' then
        shareCodes = decoded
    end
end

loadShareCodes()

local function pruneShareCodes()
    local now = os.time()
    local changed = false
    for code, entry in pairs(shareCodes) do
        if not entry.expires or entry.expires <= now then
            shareCodes[code] = nil
            changed = true
        end
    end
    if changed then saveShareCodes() end
end

---@return string
local function generateShareCode()
    local code, length = '', #SHARE_ALPHABET
    for _ = 1, 6 do
        local index = math.random(1, length)
        code = code .. SHARE_ALPHABET:sub(index, index)
    end
    if shareCodes[code] then
        Wait(0)
        return generateShareCode()
    end
    return code
end

---@param accountId number
local function trimAccountCodes(accountId)
    local owned = {}
    for code, entry in pairs(shareCodes) do
        if entry.accountId == accountId then
            owned[#owned + 1] = { code = code, expires = entry.expires or 0 }
        end
    end
    local limit = Config.Share.MaxCodesPerAccount or 5
    if #owned <= limit then return end
    table.sort(owned, function(a, b) return a.expires > b.expires end)
    for index = limit + 1, #owned do
        shareCodes[owned[index].code] = nil
    end
end

---@param id string
---@param playlistId string
---@return string | false
lib.callback.register('mx-audioplayer:createShareCode', function(source, id, playlistId)
    if not Config.Share.Enable then return false end
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:createShareCode ::: User not found', id)
        return false
    end

    local playlist = db.getPlaylist(user.accountId)
    local target = playlist and table.find(playlist, function(v) return v.id == playlistId end)
    if not target then
        Debug('mx-audioplayer:createShareCode ::: Playlist not found', playlistId)
        return false
    end

    local songs = target.songs or {}
    if #songs > (Config.Share.MaxSongs or 500) then
        Notification(source, _L('share.too_big'), 'error')
        return false
    end

    pruneShareCodes()
    local code = generateShareCode()
    shareCodes[code] = {
        accountId = user.accountId,
        expires = os.time() + (Config.Share.CodeTTL or 86400),
        playlist = {
            name = target.name,
            description = target.description,
            thumbnail = target.thumbnail,
            songs = songs,
        }
    }
    trimAccountCodes(user.accountId)
    saveShareCodes()
    return code
end)

---@param id string
---@param code string
---@return table | false
lib.callback.register('mx-audioplayer:redeemShareCode', function(source, id, code)
    if not Config.Share.Enable or type(code) ~= 'string' then return false end
    local user = table.find(AudioPlayerAccounts, function(v) return v.id == id end)
    if not user then
        Debug('mx-audioplayer:redeemShareCode ::: User not found', id)
        return false
    end

    pruneShareCodes()
    local entry = shareCodes[code:upper():gsub('%s', '')]
    if not entry then return false end
    return entry.playlist
end)
