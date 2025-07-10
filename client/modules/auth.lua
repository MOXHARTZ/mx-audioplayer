local audioplayer = require 'client.modules.audioplayer'

---@param data LoginData
---@return false | string
function Login(data)
    local id = audioplayer:getId()
    local token = lib.callback.await('mx-audioplayer:login', 0, id, data)
    return token
end

RegisterNUICallback('login', function(data, cb)
    data.password = joaat(data.password)
    local token = Login({
        username = data.username,
        password = data.password
    })
    if token then
        audioplayer:triggerListener('onLogin', token)
    end
    cb(token)
end)

RegisterNUICallback('logout', function(data, cb)
    local id = audioplayer:getId()
    local success = lib.callback.await('mx-audioplayer:logout', 0, id)
    if not success then
        Error('Failed to logout')
        return cb('error')
    end
    audioplayer:triggerListener('onLogout')
    audioplayer:toggleShortDisplay(false)
    CloseUI()
    Notification(i18n.t('you_have_logged_out'), 'success')
    cb('ok')
end)

---@param data CreateAccount
RegisterNUICallback('register', function(data, cb)
    local id = audioplayer:getId()
    local success = lib.callback.await('mx-audioplayer:register', 0, id, data.username, data.password, data.firstname, data.lastname)
    cb('ok')
end)

---@param data UpdateProfile
RegisterNUICallback('updateProfile', function(data, cb)
    Debug('updateProfile', data)
    local id = audioplayer:getId()
    local success = lib.callback.await('mx-audioplayer:updateProfile', 0, id, data)
    CloseUI()
    cb('ok')
end)

RegisterNetEvent('mx-audioplayer:login', function(playlist, user)
    audioplayer:getInfo()
    SendNUIMessage({
        action = 'open',
        data = {
            playlist = playlist,
            currentSound = user.soundData,
            user = user,
            volume = user.soundData and user.soundData.volume or AudioVolume,
        }
    })
end)
