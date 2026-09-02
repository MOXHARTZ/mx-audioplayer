if not Config.Radio.Enable then return end

local IsControlJustPressed = IsControlJustPressed
local SetVehRadioStation = SetVehRadioStation
local SetVehicleRadioEnabled = SetVehicleRadioEnabled
local GetVehicleNumberPlateText = GetVehicleNumberPlateText
local HideHudComponentThisFrame = HideHudComponentThisFrame
local DoesEntityExist = DoesEntityExist
local NetworkGetNetworkIdFromEntity = NetworkGetNetworkIdFromEntity

local vehicleAudioId = GetVehicleAudioId

local function openUi()
    if IsNuiFocused() then return end
    local _vehicle = cache.vehicle
    if not _vehicle then return end
    local radioSettings = {
        id = vehicleAudioId(_vehicle),
        silent = true,
        vehicle = _vehicle,
    }
    audioplayer:open(radioSettings, {
        onPlay = function(soundId)
            if not _vehicle or not DoesEntityExist(_vehicle) then
                return
            end
            local volume = audioplayer:getPlayer().volume
            TriggerServerEvent('mx-audioplayer:attach', soundId, NetworkGetNetworkIdFromEntity(_vehicle), volume, _vehicle)
        end,
        onLogin = function(_, _, token)
            if not _vehicle or not DoesEntityExist(_vehicle) then return Debug('radio: onLogin failed, vehicle not found') end
            Entity(_vehicle).state:set('audioplayer_account', token, true)
        end,
        onLogout = function(_, _)
            if not _vehicle or not DoesEntityExist(_vehicle) then return Debug('radio: onLogout failed, vehicle not found') end
            Entity(_vehicle).state:set('audioplayer_account', nil, true)
        end,
        autoLogin = function(_, _, token)
            if not _vehicle or not DoesEntityExist(_vehicle) then return Debug('radio: autoLogin failed, vehicle not found') end
            if not Entity(_vehicle).state.audioplayer_account then
                return
            end
            local account = Entity(_vehicle).state.audioplayer_account
            local success = Login({
                token = account
            })
            if not success then
                if ShouldReportDeadToken(account) then
                    Notification(i18n.t('login.this_user_credentials_has_been_modified'), 'error')
                end
                Entity(_vehicle).state:set('audioplayer_account', nil, true)
            end
        end,
    })
end

RegisterCommand('carRadio', openUi, false)
-- It seems that if statement is sometimes broken, so do not use if statement here.
RegisterKeyMapping('carRadio', i18n.t('radio.command'), 'keyboard', Config.Radio.RadioKey)

AddEventHandler('mx-audioplayer:vehicleEntered', function(vehicle)
    audioplayer:toggleShortDisplay(true, {
        vehicle = vehicle,
        id = vehicleAudioId(vehicle)
    })

    if Config.Radio.DisableDefaultRadio then
        SetVehRadioStation(vehicle, 'OFF')
        SetVehicleRadioEnabled(vehicle, false)
        while cache.vehicle do
            Wait(0)
            if IsControlJustPressed(0, 44) then
                HideHudComponentThisFrame(16)
                SetVehRadioStation(cache.vehicle, 'OFF')
                SetVehicleRadioEnabled(cache.vehicle, false)
            end
        end
    end
end)

AddEventHandler('mx-audioplayer:vehicleLeft', function(vehicle)
    SendNUIMessage({
        action = 'clearSound'
    })
    audioplayer:toggleShortDisplay(false)
end)

RegisterNetEvent('mx-audioplayer:disableUi', function(source, id, disabled)
    local _id = audioplayer.id
    if id ~= _id then return end
    if disabled then
        audioplayer:toggleShortDisplay(false)
    elseif audioplayer.shortDisplay.vehicle == cache.vehicle then
        audioplayer:toggleShortDisplay(true, {
            vehicle = cache.vehicle,
            id = _id
        })
    end
end)
