_G['db'] = {}
local temp = {}
local Query <const> = {
    SELECT_USER = 'SELECT * FROM audioplayer_users WHERE `username` = ? AND `password` = ?',
    SELECT_USER_BY_ID = 'SELECT * FROM audioplayer_users WHERE `id` = ?',
    SELECT_USER_ID = 'SELECT `id` FROM audioplayer_users WHERE `username` = ? AND `password` = ?',
    SELECT_PLAYLIST = 'SELECT data FROM audioplayer_playlists WHERE userId = ?',
    UPSERT_PLAYLIST = [[
        INSERT INTO audioplayer_playlists (data, userId)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data)
    ]],
    INSERT_USER = 'INSERT INTO audioplayer_users (username, password, creator, firstname, lastname) VALUES (?, ?, ?, ?, ?)'
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
    local cache = UseTemp('user_id', tempId) ---@type number | nil
    if cache then
        return cache
    end
    local id = MySQL.prepare.await(Query.SELECT_USER_ID, { username, password }) --[[@as number | nil]]
    Debug('db.getUserId', id)
    SaveTemp('user_id', id, tempId)
    return id
end

---@param username string
---@param password number
---@return Account | nil
function db.getUser(username, password)
    local tempId = username .. password
    local cache = UseTemp('user', tempId) ---@type Account | nil
    if cache then
        return cache
    end
    local user = MySQL.prepare.await(Query.SELECT_USER, { username, password }) --[[@as Account | nil]]
    Debug('db.getUser', user)
    SaveTemp('user', user, tempId)
    return user
end

---@param id number
---@return Account | nil
function db.getUserById(id)
    local cache = UseTemp('user_by_id', id) ---@type Account | nil
    if cache then
        return cache
    end
    local user = MySQL.prepare.await(Query.SELECT_USER_BY_ID, { id }) --[[@as Account | nil]]
    Debug('db.getUserById', user)
    SaveTemp('user_by_id', user, id)
    return user
end

---@param userId number
---@return Playlist[] | nil
function db.getPlaylist(userId)
    local cache = UseTemp('playlist', userId) ---@type Playlist[] | nil
    if cache then
        return cache
    end
    local data = MySQL.prepare.await(Query.SELECT_PLAYLIST, { userId })
    Debug('db.getPlaylist', userId)
    data = data and json.decode(data) or {}
    SaveTemp('playlist', data, userId)
    return data
end

---@param userId number
---@param playlist table
function db.setPlaylist(userId, playlist)
    local cache = UseTemp('playlist', userId) ---@type Playlist[] | nil
    if cache then
        DeleteTemp('playlist', userId)
    end
    MySQL.insert.await(Query.UPSERT_PLAYLIST, { json.encode(playlist), userId })
    Debug('db.setPlaylist', userId, playlist)
end

---@param username string
---@param password number
---@param firstname string
---@param lastname string
---@param identifier string
function db.insertUser(username, password, firstname, lastname, identifier)
    local insert = MySQL.insert.await(Query.INSERT_USER, { username, password, identifier, firstname, lastname })
    Debug('db.insertUser:', username, password, firstname, lastname, identifier, insert)
    return insert
end

---@param identifier string
---@param user AudioplayerAccount
---@param data UpdateProfile
function db.updateUser(identifier, user, data)
    local userData = db.getUserById(user.accountId)
    if not userData then
        Debug('db.updateUser ::: User not found', user.accountId)
        return false
    end
    if userData.creator ~= identifier then
        Error('db.updateUser ::: User trying to exploit update profile event', id, identifier)
        return false
    end
    if not data then
        Debug('db.updateUser', 'No data to update')
        return false
    end
    if data.password ~= userData.password then
        AudioPlayerAccounts = table.filter(AudioPlayerAccounts, function(v) return v.id ~= user.id end)
        Debug('db.updateUser', userData.username, 'changed password. Removing from AudioPlayerUsers')
    end
    Debug('db.updateUser', data)
    local str = 'UPDATE audioplayer_users SET'
    local params = {}
    for k, v in pairs(data) do
        str = str .. (' `%s` = :%s,'):format(k, k)
        params[k] = v
    end
    str = str:sub(1, -2) -- Remove last comma
    str = str .. ' WHERE id = :id'
    params.id = user.accountId
    Debug('params', params)
    DeleteTemp('user', userData.username .. userData.password)
    DeleteTemp('user_by_id', user.accountId)
    return MySQL.update.await(str, params)
end
