if not Config.DJ.Enable then return end

local GetEntityCoords = GetEntityCoords
local IsControlJustPressed = IsControlJustPressed
local DrawText3D = DrawText3D
local GetJobName = GetJobName

local table_includes = table.includes

local djSettings = {
    silent = false,
    staySameCoords = true,
}

local function openUi(locationData)
    djSettings.id = locationData.id
    djSettings.panner = locationData.panner
    djSettings.maxDistance = locationData.maxDistance
    audioplayer:open(djSettings)
end

if not Config.DJ.Target then
    CreateThread(function()
        local openStr = i18n.t('dj.open.menu')
        while true do
            local sleep = 1250
            for _, v in pairs(Config.DJ.Locations) do
                local ped = cache.ped
                local coords = GetEntityCoords(ped)
                local dst = #(coords - v.coords)
                local hasPerm = table_includes(Config.DJ.Jobs, GetJobName()) or not Config.DJ.Jobs
                if dst < 2.0 and hasPerm then
                    sleep = 0
                    DrawText3D(coords.x, coords.y, coords.z, openStr)
                    if IsControlJustPressed(0, 38) then
                        openUi(v)
                    end
                end
            end
            Wait(sleep)
        end
    end)
end

if Config.DJ.Target then
    CreateThread(function()
        for k, v in pairs(Config.DJ.Locations) do
            local enterCoords = v.coords
            local id = 'mx_audioplayer_dj' .. k
            exports['qtarget']:AddBoxZone(id, enterCoords, 2.0, 2.0, {
                name = id, -- This must be same with first param. qb-target is weird asf
                heading = 90.0,
                debugPoly = false,
                minZ = enterCoords.z - 15.0,
                maxZ = enterCoords.z + 5.0,
            }, {
                options = {
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('dj.target.open'),
                        action = function()
                            openUi(v)
                        end,
                        canInteract = function()
                            return table_includes(Config.DJ.Jobs, GetJobName()) or not Config.DJ.Jobs
                        end
                    }
                },
                distance = 2.5
            })
        end
    end)
end
