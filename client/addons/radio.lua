if not Config.Radio.Enable then return end

local IsControlJustPressed = IsControlJustPressed
local SetVehRadioStation = SetVehRadioStation
local SetVehicleRadioEnabled = SetVehicleRadioEnabled
local GetVehicleNumberPlateText = GetVehicleNumberPlateText
local HideHudComponentThisFrame = HideHudComponentThisFrame
local DoesEntityExist = DoesEntityExist
local NetworkGetNetworkIdFromEntity = NetworkGetNetworkIdFromEntity

-- https://github.com/zaphosting/esx/blob/master/es_extended/common/modules/math.lua
---@param value string | number
---@return string | nil
local function mathTrim(value)
    value = tostring(value)
    return (string.gsub(value, '^%s*(.-)%s*$', '%1'))
end

local function openUi()
    if IsNuiFocused() then return end
    local _vehicle = cache.vehicle
    if not _vehicle then return end
    local plate = mathTrim(GetVehicleNumberPlateText(_vehicle))
    local radioSettings = {
        id = plate,
        silent = true
    }
    audioplayer:open(radioSettings, {
        onPlay = function(soundId)
            if not cache.vehicle or not DoesEntityExist(cache.vehicle) then
                audioplayer:destroySound()
                return
            end
            local volume = audioplayer:getPlayer().volume
            TriggerServerEvent('mx-audioplayer:attach', soundId, NetworkGetNetworkIdFromEntity(cache.vehicle), volume, cache.vehicle)
        end,
        onLogin = function(_, _, token)
            if not DoesEntityExist(cache.vehicle) then return Debug('radio: onLogin failed, vehicle not found') end
            Entity(cache.vehicle).state:set('audioplayer_account', token, true)
        end,
        onLogout = function(_, _)
            if not cache.vehicle then return Debug('radio: onLogout failed, vehicle not found') end
            Entity(cache.vehicle).state:set('audioplayer_account', nil, true)
        end,
        autoLogin = function(_, _, token)
            if not cache.vehicle then return Debug('radio: autoLogin failed, vehicle not found') end
            if not Entity(cache.vehicle).state.audioplayer_account then
                return
            end
            local account = Entity(cache.vehicle).state.audioplayer_account
            local success = Login({
                token = account
            })
            if not success then
                Notification(i18n.t('login.this_user_credentials_has_been_modified'), 'error')
                Entity(cache.vehicle).state:set('audioplayer_account', nil, true)
            end
        end,
    })
end

RegisterCommand('carRadio', openUi, false)
if Config.Radio.RadioKey then
    RegisterKeyMapping('carRadio', i18n.t('radio.command'), 'keyboard', Config.Radio.RadioKey)
end

AddEventHandler('mx-audioplayer:vehicleEntered', function(vehicle)
    local plate = mathTrim(GetVehicleNumberPlateText(vehicle))
    audioplayer:toggleShortDisplay(true, {
        vehicle = vehicle,
        id = plate
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
