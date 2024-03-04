local _resourceName = GetCurrentResourceName()
local defaultLocale = json.decode(LoadResourceFile(_resourceName, 'locales/en.json')) or {}
local locale = LoadResourceFile(_resourceName, ('locales/%s.json'):format(Config.Locale))
if not locale then
    locale = defaultLocale
    print(('^3[MX-AUDIOPLAYER]^1 WARNING: ^7Locale %s does not exist, falling back to default (en).'):format(Config.Locale))
end
_T = locale and json.decode(locale) or nil
for k, v in pairs(defaultLocale) do
    if not _T[k] then
        _T[k] = v
        print(('^3[MX-AUDIOPLAYER]^1 WARNING: ^7Locale %s is missing key %s, falling back to default (en).'):format(Config.Locale, k))
    end
end
if not _T then
    error(('^3[MX-AUDIOPLAYER]^1 ERROR: ^7Failed to load locale file. Please make sure that the file %s exists and is valid JSON.'):format(('locales/%s.json'):format(Config.Locale)), 2)
end

function _U(key, ...)
    if _T[key] then
        return _T[key]:format(...)
    else
        return key
    end
end
