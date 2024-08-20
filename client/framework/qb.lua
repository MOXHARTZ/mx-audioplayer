if Config.Framework ~= 'qb' then return end

local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent('QBCore:Client:OnPlayerLoaded')
AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = GetPlayerData()
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(jobData)
    PlayerData.job = jobData
end)

function GetPlayerData()
    return QBCore.Functions.GetPlayerData()
end

function GetJobName()
    if not PlayerData then
        PlayerData = GetPlayerData()
    end
    return PlayerData?.job?.name or 'unemployed'
end
