if Config.Framework ~= 'esx' then return end

local ESX = exports['es_extended']:getSharedObject()

RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(playerData)
    PlayerData = playerData
end)

RegisterNetEvent('esx:setJob', function(jobData)
    if not PlayerData then
        PlayerData = GetPlayerData()
    end
    PlayerData.job = jobData
end)

function GetJobName()
    if not PlayerData then
        PlayerData = GetPlayerData()
    end
    return PlayerData?.job?.name or 'unemployed'
end

function GetPlayerData()
    return ESX.GetPlayerData()
end
