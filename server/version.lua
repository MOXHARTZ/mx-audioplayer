local function version()
    local self = {}
    self.currentVersion = GetResourceMetadata(GetCurrentResourceName(), 'version', 0)
    self.resourceName = GetCurrentResourceName()

    function self:checkVersionDifference(version, currentVersion)
        local _currentVersion = self.tonumberToVersion(currentVersion or self.currentVersion)
        local _version = self.tonumberToVersion(version)
        return _version - _currentVersion
    end

    function self.tonumberToVersion(version)
        local split = version:split('.')
        local version = ''
        for i = 1, #split do
            version = version .. split[i]
        end
        return tonumber(version)
    end

    function self.checkScriptVersion(script_name, minimum_version)
        if not script_name or not minimum_version then
            return false, LoopError('You must provide a script name and version.')
        end
        if GetResourceState(script_name) ~= 'started' then
            return false, LoopError(('The script named %s could not be found. This script is required for %s.'):format(script_name, GetCurrentResourceName()))
        end
        local currentVersion = GetResourceMetadata(script_name, 'version', 0)
        if not currentVersion then
            return false, LoopError(('We could not check the version. Because you are using a interesting version of %s. Please update the script.'):format(script_name))
        end
        local difference = self:checkVersionDifference(minimum_version, currentVersion)
        if difference <= 0 then return true end
        if difference > 1 then return false, LoopError(('^1You need to update the %s script. Minimum version required: %s Otherwise you can\'t use %s.'):format(script_name, minimum_version, GetCurrentResourceName())) end
        return false, LoopError(('You are using an old version of %s. Please update the script.'):format(script_name))
    end

    if self.currentVersion then
        PerformHttpRequest(('https://raw.githubusercontent.com/MOXHARTZ/%s/main/fxmanifest.lua'):format(self.resourceName), function(code, res, headers)
            if code == 404 then
                return print('Api is down. We could not check the version.')
            end
            if code == 200 then
                local version = res:match("version%s+['\"]([%d%.]+)['\"]")
                local difference = self:checkVersionDifference(version)
                if difference == 0 then return print(('^2 AWESOME ! You are using the latest version of %s. ^0'):format(self.resourceName)) end
                if difference > 5 then return error(('^1You are using a very old version of %s. Please update the script. Otherwise you may encounter errors.^0'):format(self.resourceName)) end
                return print(('You are using an old version of %s. Please update the script.'):format(self.resourceName))
            end
        end, 'GET', '', {}, {})
    else
        error(('We could not check the version. Because you are using a interesting version of %s. Please update the script.'):format(resourceName))
    end

    return self
end

Version = version()
