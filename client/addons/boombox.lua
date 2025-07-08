if not Config.Boombox.Enable then return end
CreateThread(function()
    Info('Boombox is enabled')
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

---@param entity number
---@return boolean
local function takeEntityOwnership(entity)
    if not DoesEntityExist(entity) then return false end
    local player = PlayerId()
    local netID = NetworkGetNetworkIdFromEntity(entity)
    SetNetworkIdCanMigrate(netID, true)
    SetNetworkIdExistsOnAllMachines(netID, true)
    NetworkSetNetworkIdDynamic(netID, true)
    SetNetworkIdSyncToPlayer(netID, player, true)
    local time = GetGameTimer()
    while NetworkGetEntityOwner(entity) ~= player and GetGameTimer() - time < 5000 do
        NetworkRequestControlOfEntity(entity)
        Wait(30)
    end
    return NetworkGetEntityOwner(entity) == player
end

local radioSettings = {
    silent = true
}

local function openUi()
    local boombox = nearbyBoombox()
    if not boombox then return end
    local currentBoombox = boombox
    if not NetworkGetEntityIsNetworked(currentBoombox) then return Warning('Boombox is not networked') end
    local netId = NetworkGetNetworkIdFromEntity(currentBoombox)
    Debug('netId', netId)
    radioSettings.customId = netId
    OpenAudioPlayer(radioSettings, {
        onPlay = function(sound)
            if not DoesEntityExist(currentBoombox) then
                TriggerServerEvent('mx-audioplayer:destroy', sound.soundId)
                return
            end
            local volume = AudioVolume
            TriggerServerEvent('mx-audioplayer:attach', sound.soundId, NetworkGetNetworkIdFromEntity(currentBoombox), volume)
        end,
        onLogin = function(soundId, token)
            Entity(currentBoombox).state:set('audioplayer_account', token, true)
        end,
        onLogout = function(soundId)
            Entity(currentBoombox).state:set('audioplayer_account', nil, true)
        end,
        autoLogin = function(soundId)
            local entity = Entity(currentBoombox)
            if not entity.state.audioplayer_account then
                return Debug('Auto login: No account found')
            end
            local account = entity.state.audioplayer_account
            local success = Login({
                token = account
            })
            if not success then
                Surround:pushNotification('This user credentials has been modified. Please log in again.')
                entity.state:set('audioplayer_account', nil, true)
            end
            Debug('Auto Login: success state', success)
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
    local ped = PlayerPed
    local playerCoords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
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
    TaskPlayAnim(ped, put_anim_dict, put_anim_name, 8.0, -8.0, -1, 0, 0, false, false, false)
    Wait(200)
    PlaceObjectOnGroundProperly(object)
    StopAnimTask(ped, put_anim_dict, put_anim_name, 3.0)
end

RegisterNetEvent('mx-audioplayer:boombox:create', create)

local function carryAnim()
    local ped = PlayerPed
    if not takeEntityOwnership(ped) then return end
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
    if not takeEntityOwnership(boombox) then return end
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
    if not takeEntityOwnership(boombox) then return end
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
    if not takeEntityOwnership(boombox) then return end
    SetEntityAsMissionEntity(boombox, true, true)
    DeleteEntity(boombox)
    if DoesEntityExist(boombox) then return Debug('Boombox not deleted') end
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
        exports['qtarget']:AddTargetModel(boombox_, {
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
