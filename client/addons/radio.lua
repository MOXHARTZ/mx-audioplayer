if not Config.Radio.Enable then return end
CreateThread(function()
    Info('Radio is enabled')
end)

local function openUi()
    if not IsInVehicle then return end
    local _vehicle = CurrentVehicle
    local plate = GetVehicleNumberPlateText(CurrentVehicle)
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
    AddEventHandler('mx-audioplayer:vehicleEntered', function(vehicle)
        SetVehRadioStation(vehicle, 'OFF')
        SetVehicleRadioEnabled(vehicle, false)
    end)
end
