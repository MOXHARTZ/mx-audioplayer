---@param username string
---@param password number
---@return boolean
function Login(username, password)
    local id = GetAudioplayerId()
    local success = lib.callback.await('mx-audioplayer:login', 0, id, username, password)
    return success
end

RegisterNUICallback('login', function(data, cb)
    Debug('login', data)
    data.password = joaat(data.password)
    local success = Login(data.username, data.password)
    if success then
        local id = GetAudioplayerId()
        TriggerListener(id, 'onLogin', data.username, data.password)
    end
    Debug('login success', success)
    cb(success)
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
            currentSound = CurrentSounds[id],
            user = user
        }
    })
end)
