local _resourceName = GetCurrentResourceName()
local defaultLocale = json.decode(LoadResourceFile(_resourceName, 'locales/en.json')) or {}
local locale = LoadResourceFile(_resourceName, ('locales/%s.json'):format(Config.Locale))
if not locale then
    print(('^3[mx-audioplayer]^1 WARNING: ^7Locale %s does not exist, falling back to default (en).'):format(Config.Locale))
end

_T = locale and json.decode(locale) or defaultLocale

if not _T then
    error(('^3[mx-audioplayer]^1 ERROR: ^7Failed to load locale file. Please make sure that the file %s exists and is valid JSON.'):format(('locales/%s.json'):format(Config.Locale)), 2)
end

local missing = {}

local function fillFrom(target, source, prefix)
    for key, value in pairs(source) do
        local path = prefix == '' and key or (prefix .. '.' .. key)

        if type(value) == 'table' then
            if type(target[key]) ~= 'table' then
                target[key] = {}
                fillFrom(target[key], value, path)
                missing[#missing + 1] = path
            else
                fillFrom(target[key], value, path)
            end
        elseif target[key] == nil then
            target[key] = value
            missing[#missing + 1] = path
        end
    end
end

fillFrom(_T, defaultLocale, '')

if #missing > 0 then
    CreateThread(function()
        Wait(5000)
        local preview = table.concat(missing, ', ', 1, math.min(#missing, 8))
        if #missing > 8 then preview = preview .. (', and %d more'):format(#missing - 8) end
        print(('^3[mx-audioplayer]^1 WARNING: ^7Locale %s is missing %d key(s), using English for them: %s')
            :format(Config.Locale, #missing, preview))
    end)
end

---@param key string
---@param params? { [string]: string | number }
---@return string
function _L(key, params)
    local value = _T
    for k in key:gmatch('[^.]+') do
        value = value[k]
        if not value then
            print('Missing locale for: ' .. key)
            return 'missing_' .. key
        end
    end
    if params then
        for k, v in pairs(params) do
            if type(v) == 'string' or type(v) == 'number' then
                value = value:gsub('{{' .. k .. '}}', v)
            end
        end
    end
    return value
end

_G['i18n'] = {
    t = _L
}
