if not Config.Radio.Enable then return end
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
    OpenAudioPlayer(radioSettings, {
        onPlay = function(sound)
            if not DoesEntityExist(_vehicle) then
                TriggerServerEvent('mx-audioplayer:destroy', sound.soundId)
                return
            end
            local volume = AudioVolume
            TriggerServerEvent('mx-audioplayer:attach', sound.soundId, NetworkGetNetworkIdFromEntity(_vehicle), volume, IsInVehicle)
        end
    })
end

RegisterCommand('carRadio', openUi, false)
if Config.Radio.RadioKey then
    RegisterKeyMapping('carRadio', _U('radio.command'), 'keyboard', Config.Radio.RadioKey)
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
    ToggleShortDisplay(true, {
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
    ToggleShortDisplay(false)
end)

RegisterNetEvent('mx-audioplayer:disableUi', function(source, id, state)
    if GetPlayerServerId(PlayerId()) == source then
        return
    end
    if not InvokingResource or not CustomId then
        return
    end
    local _id = InvokingResource .. CustomId
    if state and _id == id then
        ToggleShortDisplay(false, ShortDisplayData)
    elseif ShortDisplayData.vehicle == CurrentVehicle then
        ToggleShortDisplay(true, {
            vehicle = CurrentVehicle,
            customId = CustomId
        })
    end
end)
