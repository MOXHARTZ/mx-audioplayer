if not Config.Boombox.Enable then return end
CreateThread(function()
    Info('Boombox is enabled')
    InitDeprecatedScriptPlaylist('mx-boombox')
end)
local boombox_ = joaat('prop_boombox_01')
local carry_anim_dict = 'anim@heists@box_carry@'
local carry_anim_name = 'idle'
local put_anim_dict = 'random@domestic'
local put_anim_name = 'pickup_low'

local carrying_boombox = false

local function nearbyBoombox()
    local playerCoords = PlayerCoords
    local objects = GetGamePool('CObject')
    for _, object in ipairs(objects) do
        if GetEntityModel(object) == boombox_ and #(playerCoords - GetEntityCoords(object)) < 3.0 then
            return object
        end
    end
    return false
end

local radioSettings = {
    silent = true
}

local function openUi()
    local boombox = nearbyBoombox()
    if not boombox then return end
    local currentBoombox = boombox
    OpenAudioPlayer(radioSettings, {
        onPlay = function(sound)
            if not DoesEntityExist(currentBoombox) then
                TriggerServerEvent('mx-audioplayer:destroy', sound.soundId)
                return
            end
            local volume = AudioVolume
            TriggerServerEvent('mx-audioplayer:attach', sound.soundId, NetworkGetNetworkIdFromEntity(currentBoombox), volume)
        end
    })
end

local function loadAnim(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        RequestAnimDict(dict)
        Wait(5)
    end
end

local function create()
    local boombox = nearbyBoombox()
    if boombox then return end
    local player = PlayerPed
    local playerCoords = GetEntityCoords(player)
    local heading = GetEntityHeading(player)
    RequestModel(boombox_)
    while not HasModelLoaded(boombox_) do
        RequestModel(boombox_)
        Wait(5)
    end
    local object = CreateObject(boombox_, playerCoords.x, playerCoords.y, playerCoords.z, true, true, true)
    PlaceObjectOnGroundProperly(object)
    SetEntityHeading(object, heading)
    SetEntityAsMissionEntity(object, true, true)
    SetModelAsNoLongerNeeded(boombox_)
    loadAnim(put_anim_dict)
    TaskPlayAnim(player, put_anim_dict, put_anim_name, 8.0, -8.0, -1, 0, 0, false, false, false)
    Wait(200)
    PlaceObjectOnGroundProperly(object)
    StopAnimTask(player, put_anim_dict, put_anim_name, 3.0)
end

RegisterNetEvent('mx-audioplayer:boombox:create', create)

local function carryAnim()
    local ped = PlayerPed
    loadAnim(carry_anim_dict)
    while carrying_boombox do
        if IsEntityPlayingAnim(PlayerPed, carry_anim_dict, carry_anim_name, 3) then goto continue end
        TaskPlayAnim(ped, carry_anim_dict, carry_anim_name, 8.0, -8.0, -1, 51, 0, false, false, false)
        ::continue::
        Wait(500)
    end
    StopAnimTask(ped, carry_anim_dict, carry_anim_name, 3.0)
end

local function drop()
    local player = PlayerPed
    local playerCoords = GetEntityCoords(player)
    local boombox = nearbyBoombox()
    if not boombox then return end
    carrying_boombox = false
    DetachEntity(boombox, true, true)
    SetEntityCoords(boombox, playerCoords.x, playerCoords.y, playerCoords.z - 0.95, true, true, true, true)
    SetEntityAsMissionEntity(boombox, true, true)
    loadAnim(put_anim_dict)
    TaskPlayAnim(player, put_anim_dict, put_anim_name, 8.0, -8.0, -1, 0, 0, false, false, false)
    Wait(500)
    PlaceObjectOnGroundProperly(boombox)
end

local function pickup()
    local player = PlayerPed
    local boombox = nearbyBoombox()
    if not boombox then return end
    AttachEntityToEntity(boombox, player, GetPedBoneIndex(player, 24817), 0.0, 0.40, -0.0, -180.0, 90.0, 0.0, false, false, false, false, 2, true)
    carrying_boombox = true
    CreateThread(carryAnim)
    local text = _U('boombox.drop.text')
    while carrying_boombox do
        Wait(0)
        local coords = GetEntityCoords(player)
        DrawText3D(coords.x, coords.y, coords.z + 1.0, text)
        if IsControlJustPressed(0, 74) then
            drop()
            break
        end
    end
end

local function destroy()
    local boombox = nearbyBoombox()
    if not boombox then return end
    SetEntityAsMissionEntity(boombox, true, true)
    DeleteEntity(boombox)
    if Config.Boombox.Item then
        TriggerServerEvent('mx-audioplayer:boombox:destroy')
    end
end

if Config.Boombox.AccessBoomboxCommand then
    RegisterCommand(Config.Boombox.AccessBoomboxCommand, openUi, false)
end
if Config.Boombox.CreateBoomboxCommand then
    RegisterCommand(Config.Boombox.CreateBoomboxCommand, create, false)
end
if Config.Boombox.PickupBoomboxCommand then
    RegisterCommand(Config.Boombox.PickupBoomboxCommand, pickup, false)
end
if Config.Boombox.DropBoomboxCommand then
    RegisterCommand(Config.Boombox.DropBoomboxCommand, drop, false)
end
if Config.Boombox.DestroyBoomboxCommand then
    RegisterCommand(Config.Boombox.DestroyBoomboxCommand, destroy, false)
end

if Config.Boombox.Target then
    Info('Boombox target is enabled')
    CreateThread(function()
        exports['qb-target']:AddTargetModel(boombox_, {
            options = {
                {
                    icon = 'fas fa-music',
                    label = _U('boombox.target.open'),
                    action = function()
                        openUi()
                    end
                },
                {
                    icon = 'fas fa-music',
                    label = _U('boombox.target.pickup'),
                    action = function()
                        pickup()
                    end
                },
                {
                    icon = 'fas fa-music',
                    label = _U('boombox.target.destroy'),
                    action = function()
                        destroy()
                    end
                }
            },
            distance = 2.5
        })
    end)
end
