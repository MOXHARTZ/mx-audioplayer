_G['db'] = {}
local temp = {}
local Query <const> = {
    SELECT_USER_ID = 'SELECT id FROM audioplayer_users WHERE username = ? AND password = ?',
    SELECT_PLAYLIST = 'SELECT * FROM audioplayer_playlists WHERE userId = ?',
    INSERT_USER = 'INSERT INTO casino_memberships (username, password, creator) VALUES (?, ?, ?)',
    UPSERT_MEMBERSHIP = [[
        INSERT INTO casino_memberships (identifier, %s)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE %s = VALUES(%s)
    ]],

    SELECT_BLOCKED_PLAYERS = 'SELECT * FROM casino_blocked_players',
    INSERT_BLOCKED_PLAYER = 'INSERT INTO casino_blocked_players (identifier, reason) VALUES (?, ?)',
    DELETE_BLOCKED_PLAYER = 'DELETE FROM casino_blocked_players WHERE identifier = ?'
}

---@param name string
---@param data any
---@param id? string | number
---@param expire? number
function SaveTemp(name, data, id, expire)
    if not data then
        Debug('No data to save to cache', name, id)
        return
    end
    if expire then
        expire = os.time() + expire
    else
        expire = os.time() + 1000 * 60 * 60 -- 60 minutes
    end
    temp[#temp + 1] = {
        name = name,
        id = id,
        time = os.time(),
        expire = expire,
        data = data
    }
    Debug('Saved to cache', name, id)
end

---@param name string
---@param id? string | number
function DeleteTemp(name, id)
    local fn = function(v) return v.name ~= name and v.id ~= id end
    if not id then
        fn = function(v) return v.name ~= name end
    end
    temp = table.filter(temp, fn)
    Debug('Deleted cache', name, id)
end

---@param name string
---@param id? string | number
---@return any
function UseTemp(name, id)
    local fn = function(v) return v.name == name and v.id == id end
    if not id then
        fn = function(v) return v.name == name end
    end
    local cache = table.find(temp, fn)
    if cache then
        Debug('Cache hit', name, id)
        return cache.data
    end
    return nil
end

---@param username string
---@param password number
---@return number?
function db.getUserId(username, password)
    local tempId = username .. password
    local cache = UseTemp('user', tempId) ---@type number | nil
    if cache then
        return cache
    end
    local id = MySQL.prepare.await(Query.SELECT_USER_ID, { username, password }) --[[@as number | nil]]
    Debug('db.getUserId', id)
    SaveTemp('user', id, tempId)
    return id
end

---@param userId number
---@return Playlist[] | nil
function db.getPlaylist(userId)
    local cache = UseTemp('playlist', userId) ---@type Playlist[] | nil
    if cache then
        return cache
    end
    local data = MySQL.query.await(Query.SELECT_PLAYLIST, { userId }) --[[@as Playlist[] | nil]]
    SaveTemp('playlist', data, userId)
    Debug('db.getPlaylist', userId)
    return data
end

---@param username string
---@param password number
---@param identifier string
function db.insertUser(username, password, identifier)
    local insert = MySQL.insert.await(Query.INSERT_USER, { username, password, identifier })
    Debug('db.insertUser:', username, password, identifier)
    return insert
end
