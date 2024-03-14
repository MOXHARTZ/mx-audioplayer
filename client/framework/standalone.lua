if Config.Framework ~= 'standalone' then return end

function GetJobName()
    Info('No framework found. Job name is now "unemployed".')
    return 'unemployed'
end

function GetPlayerData()
    Info('No framework found. Player data is now empty.')
    return {}
end
