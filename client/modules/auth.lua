---@param data LoginData
---@return false | string
function Login(data)
    local id = GetAudioplayerId()
    local token = lib.callback.await('mx-audioplayer:login', 0, id, data)
    return token
end

RegisterNUICallback('login', function(data, cb)
    Debug('login', data)
    data.password = joaat(data.password)
    local token = Login({
        username = data.username,
        password = data.password
    })
    if token then
        local id = GetAudioplayerId()
        TriggerListener(id, 'onLogin', token)
    end
    Debug('login token', token)
    cb(token)
end)

RegisterNUICallback('logout', function(data, cb)
    Debug('logout')
    local id = GetAudioplayerId()
    local success = lib.callback.await('mx-audioplayer:logout', 0, id)
    Debug('logout success', success)
    TriggerListener(id, 'onLogout')
    CloseUI()
    Surround:pushNotification('You have logged out of your account.')
    cb('ok')
end)

---@param data CreateAccount
RegisterNUICallback('register', function(data, cb)
    Debug('Register', data)
    local id = GetAudioplayerId()
    local success = lib.callback.await('mx-audioplayer:register', 0, id, data.username, data.password, data.firstname, data.lastname)
    Debug('Register success', success)
    cb('ok')
end)

---@param data UpdateProfile
RegisterNUICallback('updateProfile', function(data, cb)
    Debug('updateProfile', data)
    local id = GetAudioplayerId()
    local success = lib.callback.await('mx-audioplayer:updateProfile', 0, id, data)
    Debug('updateProfile success', success)
    CloseUI()
    cb('ok')
end)

RegisterNetEvent('mx-audioplayer:login', function(playlist, user)
    local id = GetAudioplayerId()
    SendNUIMessage({
        action = 'open',
        data = {
            playlist = playlist,
            currentSound = CurrentSoundData,
            user = user,
            volume = CurrentSoundData and CurrentSoundData.volume or AudioVolume,
        }
    })
end)
