if Config.Framework ~= 'esx' then return end

ESX = exports['es_extended']:getSharedObject()

function RegisterUsableItem(name, cb)
    ESX.RegisterUsableItem(name, cb)
end

function GetPlayerFromId(source)
    return ESX.GetPlayerFromId(source)
end

function GetCharacterName(source)
    local xPlayer = GetPlayerFromId(source)
    local firstName, lastName
    if xPlayer.get and xPlayer.get('firstName') and xPlayer.get('lastName') then
        firstName = xPlayer.get('firstName')
        lastName = xPlayer.get('lastName')
    else
        local name = MySQL.Sync.fetchAll('SELECT firstname, lastname FROM users WHERE identifier = ?', { xPlayer.identifier })
        firstName, lastName = name[1]?.firstname or '', name[1]?.lastname or ''
    end

    return firstName, lastName
end

function AddItem(source, item, count, slot, metadata)
    local player = GetPlayerFromId(source)
    player.addInventoryItem(item, count, metadata, slot)
end

function RemoveItem(source, item, count, slot)
    local player = GetPlayerFromId(source)
    player.removeInventoryItem(item, count, slot)
end
