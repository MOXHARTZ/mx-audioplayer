function Debug(...)
    if not Config.Debug then return end
    local msg = '^2[AUDIOPLAYER DEBUG]:^0 '
    for i, v in pairs({ ... }) do
        if type(v) == 'table' then
            msg = msg .. json.encode(v) .. '\t'
        else
            msg = msg .. tostring(v) .. '\t'
        end
    end
    msg = msg
    print(msg)
end

function Warning(...)
    local msg = '^3[AUDIOPLAYER WARNING]:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

function Info(...)
    local msg = '^5[AUDIOPLAYER INFO]:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

function Error(...)
    local msg = '^1[AUDIOPLAYER ERROR]:^0 '
    for i, v in pairs({ ... }) do
        msg = msg .. tostring(v) .. '\t'
    end
    msg = msg
    print(msg)
end

function LoopError(...)
    local unpacked = table.unpack({ ... })
    CreateThread(function()
        while true do
            print('^1[ERROR]:^7', unpacked)
            Wait(2000)
        end
    end)
end

---@generic T
---@param t T[]
---@param value number | string
table.includes = function(t, value)
    if not t then return false end
    for k, v in pairs(t) do
        if v == value then
            return true
        end
    end
    return false
end

---@generic T
---@param arr T[]
---@param func fun(value: T, index: any): boolean
---@return T, any | false
table.find = function(arr, func)
    if not arr then return false, false end
    for i, v in pairs(arr) do
        if type(func) == 'function' then
            if func(v, i) then return v, i end
        else
            if v == func then return v, i end
        end
    end
    return false, false
end

---@param str string
---@param sep? string
string.split = function(str, sep)
    local sep, fields = sep or ':', {}
    local pattern = string.format('([^%s]+)', sep)
    str:gsub(pattern, function(c) fields[#fields + 1] = c end)
    return fields
end

---@generic T
---@param t T[]
---@param filterIter fun(value: T, key: any, table: table): boolean
---@return T[]
table.filter = function(t, filterIter)
    local out = {}
    for k, v in pairs(t) do
        if filterIter(v, k, t) then
            table.insert(out, v)
        end
    end
    return out
end

---@generic T
---@param t T[]
---@param mapIter fun(value: any, key: any, table: table): any
---@return table
table.map = function(t, mapIter)
    local out = {}
    for k, v in pairs(t) do
        table.insert(out, mapIter(v, k, t))
    end
    return out
end

---@generic T
---@param t T[]
---@param first number
---@param last number
---@param step? number
---@return T[]
table.slice = function(t, first, last, step)
    local sliced = {}
    for i = first or 1, last or #t, step or 1 do
        sliced[#sliced + 1] = t[i]
    end
    return sliced
end

---@generic T
---@param data {[string]: string}
---@return string | false
function DependencyCheck(data)
    for k, v in pairs(data) do
        if GetResourceState(k):find('started') ~= nil then
            return v
        end
    end
    return false
end

---@param time number -- In Seconds
---@return string -- Formatted Time. Like 10 seconds, 1 minute, 1 hour, 1 day
function FormatTime(time)
    if time < 60 then
        return time .. ' seconds'
    elseif time < 3600 then
        return math.floor(time / 60) .. ' min'
    elseif time < 86400 then
        return math.floor(time / 3600) .. ' hours'
    else
        return math.floor(time / 86400) .. ' days'
    end
end

local implemenetCaches = {}
function ImplementError(name)
    if implemenetCaches[name] then
        return
    end
    print('^1[IMPLEMENT ERROR]^7', name)
    implemenetCaches[name] = true
end
