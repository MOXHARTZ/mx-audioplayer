Config = {}

Config.Debug = true
Config.Locale = 'en'

Config.Radio = {}
Config.Radio.Enable = true
Config.Radio.DisableDefaultRadio = true -- Set to false if you want to use the default radio stations
Config.Radio.RadioKey = 'N'             -- Default key to open the radio

Config.Boombox = {}
Config.Boombox.Enable = true
Config.Boombox.Item = 'boombox' -- Set false if you don't want item.
Config.Boombox.Target = true    -- Uses qb-target. But if you are using ox_target it'll provide this.

-- Close commands you do not want to use by setting false. Ex: Config.Boombox.CreateBoomboxCommand = false
Config.Boombox.CreateBoomboxCommand = 'bx-create'
Config.Boombox.PickupBoomboxCommand = 'bx-pickup'
Config.Boombox.DropBoomboxCommand = 'bx-drop'
Config.Boombox.DestroyBoomboxCommand = 'bx-destroy'
Config.Boombox.AccessBoomboxCommand = 'bx'

Config.DJ = {}
Config.DJ.Enable = true
Config.DJ.Item = 'sandwich'                            -- Set false if you don't want item.
Config.DJ.Target = true                                -- Uses qb-target. But if you are using ox_target it'll provide this.
Config.DJ.Jobs = { 'police', 'ambulance', 'mechanic' } -- Jobs that can use the DJ (you can set false if you want to allow everyone)
Config.DJ.Locations = {
    {
        id = 'Sex On The Beach',                                                      -- Unique ID
        coords = vector3(-1382.1446533203125, -614.4506225585938, 31.49793624877929), -- Location
    }
}

local function getFramework()
    local esxHas = GetResourceState('es_extended') == 'started'
    local qbHas = GetResourceState('qb-core') == 'started'
    if esxHas then
        return 'esx'
    elseif qbHas then
        return 'qb'
    end
    return 'standalone'
end

Config.Framework = getFramework()

if Config.Framework == 'standalone' then
    Config.DJ.Jobs = false
    Info('DJ is enabled but no framework found. DJ is now available for everyone.')
end

local function checkHasTarget()
    local hasTarget = GetResourceState('qb-target') == 'started' or GetResourceState('ox_target') == 'started'
    if not hasTarget then
        Config.Boombox.Target = false
        Config.DJ.Target = false
        Info('No target resource found. Boombox and DJ will not use target.')
    end
end

if Config.Boombox.Target or Config.DJ.Target then
    checkHasTarget()
end
