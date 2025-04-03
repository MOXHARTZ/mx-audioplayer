if Config.Framework ~= 'qb' then return end

QBCore = exports['qb-core']:GetCoreObject()

function GetPlayerFromId(source)
    source = tonumber(source)
    return QBCore.Functions.GetPlayer(source)
end

function GetIdentifier(source)
    local player = GetPlayerFromId(source)
    if player and player.PlayerData and player.PlayerData.citizenid then
        return player.PlayerData.citizenid
    end
    return nil
end

function RegisterUsableItem(name, cb)
    QBCore.Functions.CreateUseableItem(name, cb)
end

function GetCharacterName(source)
    local player = GetPlayerFromId(source).PlayerData.charinfo
    return player.firstname, player.lastname
end

function AddItem(source, item, count, slot, metadata)
    local player = GetPlayerFromId(source)
    player.Functions.AddItem(item, count, slot, metadata)
end

function RemoveItem(source, item, count, slot)
    local player = GetPlayerFromId(source)
    player.Functions.RemoveItem(item, count, slot)
end
