if not Config.DJ.Enable then return end

local djSettings = {
    silent = false,
    staySameCoords = true,
}

local function openUi(locationData)
    djSettings.customId = locationData.id
    djSettings.panner = locationData.panner
    OpenAudioPlayer(djSettings)
end

if not Config.DJ.Target then
    CreateThread(function()
        local openStr = _U('dj.open.menu')
        while true do
            local sleep = 1250
            for k, v in pairs(Config.DJ.Locations) do
                local coords = v.coords
                local dst = #(PlayerCoords - coords)
                local hasPerm = table.includes(Config.DJ.Jobs, GetJobName()) or not Config.DJ.Jobs
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
    Info('DJ target is enabled')
    CreateThread(function()
        for k, v in pairs(Config.DJ.Locations) do
            local enterCoords = v.coords
            local id = 'mx_audioplayer_dj' .. k
            exports['qb-target']:AddBoxZone(id, enterCoords, 2.0, 2.0, {
                name = id, -- This must be same with first param. qb-target is weird asf
                heading = 90.0,
                debugPoly = false,
                minZ = enterCoords.z - 15.0,
                maxZ = enterCoords.z + 5.0,
            }, {
                options = {
                    {
                        icon = 'fas fa-music',
                        label = _U('dj.target.open'),
                        action = function()
                            openUi(v)
                        end,
                        canInteract = function()
                            return table.includes(Config.DJ.Jobs, GetJobName()) or not Config.DJ.Jobs
                        end
                    }
                },
                distance = 2.5
            })
        end
    end)
end
