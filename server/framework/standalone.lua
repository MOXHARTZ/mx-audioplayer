if Config.Framework ~= 'standalone' then return end

function RegisterUsableItem(name, cb)
    print('RegisterUsableItem is not supported with standalone')
    return false
end

function GetIdentifier(source)
    print('Get Identifier : You need to implement this function for your framework.')
    for k, v in pairs(GetPlayerIdentifiers(source)) do
        if string.sub(v, 1, string.len('license:')) == 'license:' then
            return v:gsub('license:', '')
        end
    end
    return nil
end

function GetPlayerFromId(source)
    return {
        source = source,
        identifier = GetIdentifier(source)
    }
end

function GetPlayerSource(player)
    return player.source
end

function GetCharacterName(source)
    print('Get Character Name : You need to implement this function for your framework.')
    local name = GetPlayerName(source)
    return name, 'Unknown'
end

function AddItem(source, item, count, slot, metadata)
    print('Add Item : You need to implement this function for your framework.')
    return true
end

function RemoveItem(source, item, count, slot)
    print('Remove Item : You need to implement this function for your framework.')
    return true
end
