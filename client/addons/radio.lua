if not Config.Radio.Enable then return end
local audioplayer = require 'client.modules.audioplayer'
CreateThread(function()
    Info('Radio is enabled')
end)

-- https://github.com/zaphosting/esx/blob/master/es_extended/common/modules/math.lua
---@param value string | number
---@return string | nil
local function mathTrim(value)
    value = tostring(value)
    return (string.gsub(value, '^%s*(.-)%s*$', '%1'))
end

local function openUi()
    if not IsInVehicle then return end
    local _vehicle = CurrentVehicle
    local plate = mathTrim(GetVehicleNumberPlateText(CurrentVehicle))
    local radioSettings = {
        customId = plate,
        silent = true
    }
    audioplayer:open(radioSettings, {
        onPlay = function(sound)
            Debug('onPlay ::: sound', sound)
            if not DoesEntityExist(_vehicle) then
                TriggerServerEvent('mx-audioplayer:destroy', sound.soundId)
                return
            end
            local volume = AudioVolume
            TriggerServerEvent('mx-audioplayer:attach', sound.soundId, NetworkGetNetworkIdFromEntity(_vehicle), volume, IsInVehicle)
        end,
        onLogin = function(soundId, token)
            Debug('Login', soundId, token)
            if not IsInVehicle then return end
            Entity(CurrentVehicle).state:set('audioplayer_account', token, true)
        end,
        onLogout = function(soundId)
            Debug('Logout', soundId)
            if not IsInVehicle then return end
            Entity(CurrentVehicle).state:set('audioplayer_account', nil, true)
        end,
        autoLogin = function(soundId)
            if not IsInVehicle then return end
            if not Entity(CurrentVehicle).state.audioplayer_account then
                return Debug('Auto login: No account found')
            end
            local account = Entity(CurrentVehicle).state.audioplayer_account
            local success = Login({
                token = account
            })
            if not success then
                Notification('This user credentials has been modified. Please log in again.', 'error')
                Entity(CurrentVehicle).state:set('audioplayer_account', nil, true)
            end
            Debug('Auto Login: success state', success)
        end,
    })
end

RegisterCommand('carRadio', openUi, false)
if Config.Radio.RadioKey then
    RegisterKeyMapping('carRadio', i18n.t('radio.command'), 'keyboard', Config.Radio.RadioKey)
end

if Config.Radio.DisableDefaultRadio then
    CreateThread(function()
        while true do
            local sleep = 1250
            if IsInVehicle then
                sleep = 0
                if IsControlJustPressed(0, 44) then
                    HideHudComponentThisFrame(16)
                    SetVehRadioStation(CurrentVehicle, 'OFF')
                    SetVehicleRadioEnabled(CurrentVehicle, false)
                end
            end
            Wait(sleep)
        end
    end)
end

AddEventHandler('mx-audioplayer:vehicleEntered', function(vehicle)
    local plate = mathTrim(GetVehicleNumberPlateText(vehicle))
    audioplayer:toggleShortDisplay(true, {
        vehicle = vehicle,
        customId = plate
    })
    if not Config.Radio.DisableDefaultRadio then
        return
    end
    SetVehRadioStation(vehicle, 'OFF')
    SetVehicleRadioEnabled(vehicle, false)
end)

AddEventHandler('mx-audioplayer:vehicleLeft', function(vehicle)
    SendNUIMessage({
        action = 'clearSound'
    })
    audioplayer:toggleShortDisplay(false)
end)

RegisterNetEvent('mx-audioplayer:playSound', function(id)
    if not InvokingResource or not CustomId then
        return
    end
    local _id = InvokingResource .. CustomId
    if _id ~= id then
        return Debug('playSound ::: id mismatch', _id, id)
    end
    audioplayer:toggleShortDisplay(true, {
        vehicle = CurrentVehicle,
        customId = CustomId
    })
end)

-- RegisterNetEvent('mx-audioplayer:disableUi', function(source, id, state)
--     if GetPlayerServerId(PlayerId()) == source then
--         return
--     end
--     if not InvokingResource or not CustomId then
--         return
--     end
--     local _id = InvokingResource .. CustomId
--     if state and _id == id then
--         ToggleShortDisplay(false, ShortDisplayData)
--     elseif ShortDisplayData.vehicle == CurrentVehicle then
--         ToggleShortDisplay(true, {
--             vehicle = CurrentVehicle,
--             customId = CustomId
--         })
--     end
-- end)
