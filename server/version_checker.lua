local currentVersion = GetResourceMetadata(GetCurrentResourceName(), 'version', 0)
local resourceName = GetCurrentResourceName()

string.split = function(str, sep)
    local sep, fields = sep or ':', {}
    local pattern = string.format('([^%s]+)', sep)
    str:gsub(pattern, function(c) fields[#fields + 1] = c end)
    return fields
end

local function tonumberToVersion(number)
    local split = number:split('.')
    local version = ''
    for i = 1, #split do
        version = version .. split[i]
    end
    return tonumber(version)
end

local function checkVersionDifference(version)
    local _currentVersion = tonumberToVersion(currentVersion)
    local _version = tonumberToVersion(version)
    return _version - _currentVersion
end

if currentVersion then
    PerformHttpRequest(('https://raw.githubusercontent.com/MOXHARTZ/%s/main/fxmanifest.lua'):format(resourceName), function(code, res, headers)
        if code == 404 then
            return print('Api is down. We could not check the version.')
        end
        if code == 200 then
            local version = res:match("version%s+['\"]([%d%.]+)['\"]")
            local difference = checkVersionDifference(version)
            if difference == 0 then return print(('^2 AWESOME ! You are using the latest version of %s. ^0'):format(resourceName)) end
            if difference > 5 then return error(('^1You are using a very old version of %s. Please update the script. Otherwise you may encounter errors.^0'):format(resourceName)) end
            return print(('You are using an old version of %s. Please update the script.'):format(resourceName))
        end
    end, 'GET', '', {}, {})
else
    error(('We could not check the version. Because you are using a interesting version of %s. Please update the script.'):format(resourceName))
end
