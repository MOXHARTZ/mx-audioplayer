function Debug(...)
    if not Config.Debug then return end
    local msg = '^2AUDIOPLAYER DEBUG:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

function Warning(...)
    local msg = '^3AUDIOPLAYER WARNING:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

function Info(...)
    local msg = '^5AUDIOPLAYER INFO:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

function Error(...)
    local msg = '^1AUDIOPLAYER ERROR:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

table.includes = function(t, value)
    for k, v in pairs(t) do
        if v == value then
            return true
        end
    end
    return false
end

---@param arr table
---@param func function | any
---@return table | false, number | false
table.find = function(arr, func)
    if not arr then return false, false end
    for i, v in ipairs(arr) do
        if type(func) == 'function' then
            if func(v, i) then return v, i end
        else
            if v == func then return v, i end
        end
    end
    return false, false
end
