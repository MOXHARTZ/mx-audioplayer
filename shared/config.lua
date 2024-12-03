Config = {}

Config.Debug = false
Config.Locale = 'en' -- 'en', 'fr', 'de', 'bg', 'es', 'it', 'ltu', 'cn', 'ro'

Config.Radio = {}
Config.Radio.Enable = true
Config.Radio.DisableDefaultRadio = true -- Set to false if you want to use the default radio stations
Config.Radio.RadioKey = 'N'             -- Default key to open the radio (You can set false if you don't want a key)

Config.Boombox = {}
Config.Boombox.Enable = true
Config.Boombox.Item = 'boombox' -- Set false if you don't want item.
Config.Boombox.Target = true    -- Uses qtarget. But if you are using ox_target it'll provide this.

-- Close commands you do not want to use by setting false. Ex: Config.Boombox.CreateBoomboxCommand = false
Config.Boombox.CreateBoomboxCommand = 'bx-create'
Config.Boombox.PickupBoomboxCommand = 'bx-pickup'
Config.Boombox.DropBoomboxCommand = 'bx-drop'
Config.Boombox.DestroyBoomboxCommand = 'bx-destroy'
Config.Boombox.AccessBoomboxCommand = 'bx'

Config.DJ = {}
Config.DJ.Enable = true
Config.DJ.Target = true                                -- Uses qtarget. But if you are using ox_target it'll provide this.
Config.DJ.Jobs = { 'police', 'ambulance', 'mechanic' } -- Jobs that can use the DJ (you can set false if you want to allow everyone)
Config.DJ.Locations = {
    {
        id = 'Sex On The Beach',                                                      -- Unique ID
        coords = vector3(-1382.1446533203125, -614.4506225585938, 31.49793624877929), -- Location
        panner = {                                                                    -- optional. Useful for big areas
            -- https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
            panningModel = 'HRTF',
            refDistance = 15.0,            -- Distance of the volume dropoff start (bigger = more distance)
            rolloffFactor = 1.8,           -- How fast the volume drops off
            distanceModel = 'exponential', -- How the volume drops off (linear, inverse, exponential)

        }
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
    print('DJ is enabled but no framework found. DJ is now available for everyone.')
end

local function checkHasTarget()
    local hasTarget = GetResourceState('qtarget') == 'started' or GetResourceState('ox_target') == 'started'
    if not hasTarget then
        Config.Boombox.Target = false
        Config.DJ.Target = false
        print('No target resource found. Boombox and DJ will not use target.')
    end
end

if Config.Boombox.Target or Config.DJ.Target then
    checkHasTarget()
end
