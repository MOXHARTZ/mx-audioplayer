Config = {}

Config.Debug = false
Config.Locale = 'en'

Config.Radio = {}
Config.Radio.Enable = true
Config.Radio.DisableDefaultRadio = true
Config.Radio.RadioKey = 'N'

Config.EnableAccountSharing = true

Config.Boombox = {}
Config.Boombox.Enable = true
Config.Boombox.Item = 'boombox'
Config.Boombox.Target = true

Config.Boombox.CreateBoomboxCommand = 'bx-create'
Config.Boombox.PickupBoomboxCommand = 'bx-pickup'
Config.Boombox.DropBoomboxCommand = 'bx-drop'
Config.Boombox.DestroyBoomboxCommand = 'bx-destroy'
Config.Boombox.AccessBoomboxCommand = 'bx'

Config.DJ = {}
Config.DJ.Enable = true
Config.DJ.Target = true
Config.DJ.Jobs = { 'police', 'ambulance', 'mechanic' }
Config.DJ.Locations = {
    {
        id = 'Sex On The Beach',
        coords = vector3(-1382.1446533203125, -614.4506225585938, 31.49793624877929),
        panner = {
            panningModel = 'HRTF',
            refDistance = 15.0,
            rolloffFactor = 1.8,
            distanceModel = 'exponential',
        },
        maxDistance = 150.0
    }
}

Config.Queue = {}
Config.Queue.Enable = true
Config.Queue.MaxSize = 50

Config.Fade = {}
Config.Fade.Enable = true
Config.Fade.Out = 1.5
Config.Fade.In = 1.5
Config.Fade.Curve = 1.5
Config.Fade.StepMs = 100
Config.Fade.AllowPlayerOverride = true

Config.Stations = {}
Config.Stations.Enable = true
Config.Stations.PlaylistId = '__radio'
Config.Stations.List = {
    {
        id = 'lofi_beats',
        title = 'Lofi Beats',
        artist = 'Chill / Study',
        query = 'lofi hip hop radio beats to relax study to',
    },
    {
        id = 'lofi_sleep',
        title = 'Sleepy Lofi',
        artist = 'Slow / Night',
        query = 'lofi hip hop radio beats to sleep chill to',
    },
    {
        id = 'synthwave',
        title = 'Synthwave',
        artist = 'Retro / Drive',
        cover = 'https://i.ytimg.com/vi/4xDzrJKXOOY/maxresdefault_live.jpg',
        url = 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
        query = 'synthwave radio 24/7 live retro',
    },
    {
        id = 'chillhop',
        title = 'Chillhop',
        artist = 'Jazzy / Lofi',
        cover = 'https://i.ytimg.com/vi/5yx6BWlEVcY/maxresdefault_live.jpg',
        url = 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
        query = 'chillhop radio jazzy lofi hip hop beats live',
    },
    {
        id = 'jazz',
        title = 'Jazz Lounge',
        artist = 'Smooth / Evening',
        query = 'relaxing jazz radio 24/7 live smooth jazz',
    },
    {
        id = 'deep_house',
        title = 'Deep House',
        artist = 'Club / Late',
        query = 'deep house radio 24/7 live mix',
    },
    {
        id = 'phonk',
        title = 'Phonk',
        artist = 'Drift / Hard',
        query = 'phonk radio 24/7 live drift',
    },
    {
        id = 'dnb',
        title = 'Drum and Bass',
        artist = 'Fast / Heavy',
        query = 'drum and bass radio 24/7 live',
    },
    {
        id = 'hiphop',
        title = 'Hip Hop',
        artist = 'Rap / Beats',
        query = 'hip hop radio 24/7 live rap beats',
    },
    {
        id = 'rock',
        title = 'Rock Classics',
        artist = 'Guitars / Loud',
        query = 'classic rock radio 24/7 live',
    },
    {
        id = 'ambient',
        title = 'Ambient',
        artist = 'Space / Calm',
        query = 'ambient space music radio 24/7 live',
    },
    {
        id = 'anime_lofi',
        title = 'Anime Lofi',
        artist = 'Soft / Study',
        query = 'anime lofi radio 24/7 live',
    },
    {
        id = 'gaming',
        title = 'Gaming Mix',
        artist = 'EDM / Energy',
        query = 'gaming music radio 24/7 live edm mix',
    },
}

Config.Share = {}
Config.Share.Enable = true
Config.Share.CodeTTL = 24 * 60 * 60
Config.Share.MaxSongs = 500
Config.Share.MaxCodesPerAccount = 5

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
    local hasTarget = GetResourceState('qtarget') == 'started' or GetResourceState('ox_target') == 'started' or GetResourceState('qb-target') == 'started'
    if not hasTarget then
        Config.Boombox.Target = false
        Config.DJ.Target = false
        print('No target resource found. Boombox and DJ will not use target.')
    end
end

if Config.Boombox.Target or Config.DJ.Target then
    checkHasTarget()
end

if Config.Stations.Enable then
    for _, station in ipairs(Config.Stations.List) do
        if not station.id or (not station.url and not station.query) then
            print(('[mx-audioplayer] Station "%s" needs an id plus a url or a query, and will not play.'):format(station.id or station.title or '?'))
        end
    end
end
