if not Config.Radio then return end
CreateThread(function()
    Info('Radio is enabled')
    InitDeprecatedScriptPlaylist('mx-caradio')
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
RegisterKeyMapping('carRadio', _U('radio.command'), 'keyboard', Config.Radio.RadioKey)

local disabledRadios = {
    'RADIO_01_CLASS_ROCK',
    'RADIO_02_POP',
    'RADIO_03_HIPHOP_NEW',
    'RADIO_04_PUNK',
    'RADIO_05_TALK_01',
    'RADIO_06_COUNTRY',
    'RADIO_07_DANCE_01',
    'RADIO_08_MEXICAN',
    'RADIO_09_HIPHOP_OLD',
    'RADIO_12_REGGAE',
    'RADIO_13_JAZZ',
    'RADIO_14_DANCE_02',
    'RADIO_15_MOTOWN',
    'RADIO_20_THELAB',
    'RADIO_16_SILVERLAKE',
    'RADIO_17_FUNK',
    'RADIO_18_90S_ROCK',
    'RADIO_21_DLC_XM17',
    'RADIO_22_DLC_BATTLE_MIX1_RADIO',
    'RADIO_19_USER',
    'HIDDEN_RADIO_AMBIENT_TV',
    'HIDDEN_RADIO_AMBIENT_TV_BRIGHT',
    'HIDDEN_RADIO_01_CLASS_ROCK',
    'HIDDEN_RADIO_ADVERTS',
    'HIDDEN_RADIO_02_POP',
    'HIDDEN_RADIO_03_HIPHOP_NEW',
    'HIDDEN_RADIO_04_PUNK',
    'HIDDEN_RADIO_06_COUNTRY',
    'HIDDEN_RADIO_07_DANCE_01',
    'HIDDEN_RADIO_09_HIPHOP_OLD',
    'HIDDEN_RADIO_12_REGGAE',
    'HIDDEN_RADIO_15_MOTOWN',
    'HIDDEN_RADIO_16_SILVERLAKE',
    'RADIO_22_DLC_BATTLE_MIX1_CLUB',
    'HIDDEN_RADIO_STRIP_CLUB',
    'DLC_BATTLE_MIX1_CLUB_PRIV',
    'HIDDEN_RADIO_BIKER_CLASSIC_ROCK',
    'DLC_BATTLE_MIX2_CLUB_PRIV',
    'HIDDEN_RADIO_BIKER_MODERN_ROCK',
    'RADIO_23_DLC_BATTLE_MIX2_CLUB',
    'RADIO_25_DLC_BATTLE_MIX4_CLUB',
    'DLC_BATTLE_MIX3_CLUB_PRIV',
    'RADIO_26_DLC_BATTLE_CLUB_WARMUP',
    'HIDDEN_RADIO_BIKER_PUNK',
    'RADIO_24_DLC_BATTLE_MIX3_CLUB',
    'DLC_BATTLE_MIX4_CLUB_PRIV',
    'HIDDEN_RADIO_BIKER_HIP_HOP'
}

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
                    for _, radio in ipairs(disabledRadios) do
                        SetRadioStationDisabled(radio, true)
                    end
                end
            end
            Wait(sleep)
        end
    end)
end
