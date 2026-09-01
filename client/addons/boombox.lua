if not Config.Boombox.Enable then return end

local GetEntityCoords = GetEntityCoords
local GetGamePool = GetGamePool
local GetEntityModel = GetEntityModel
local DoesEntityExist = DoesEntityExist
local NetworkGetNetworkIdFromEntity = NetworkGetNetworkIdFromEntity
local NetworkGetEntityIsNetworked = NetworkGetEntityIsNetworked
local NetworkDoesNetworkIdExist = NetworkDoesNetworkIdExist
local NetworkRegisterEntityAsNetworked = NetworkRegisterEntityAsNetworked
local SetNetworkIdCanMigrate = SetNetworkIdCanMigrate
local SetNetworkIdExistsOnAllMachines = SetNetworkIdExistsOnAllMachines
local NetworkSetNetworkIdDynamic = NetworkSetNetworkIdDynamic
local SetNetworkIdSyncToPlayer = SetNetworkIdSyncToPlayer
local NetworkGetEntityOwner = NetworkGetEntityOwner
local CreateObject = CreateObject
local PlaceObjectOnGroundProperly = PlaceObjectOnGroundProperly
local SetEntityHeading = SetEntityHeading
local SetEntityAsMissionEntity = SetEntityAsMissionEntity
local SetModelAsNoLongerNeeded = SetModelAsNoLongerNeeded
local DeleteEntity = DeleteEntity
local DrawText3D = DrawText3D
local IsControlJustPressed = IsControlJustPressed

local boomboxModel = joaat('prop_boombox_01')
local carry_anim_dict = 'anim@heists@box_carry@'
local carry_anim_name = 'idle'
local put_anim_dict = 'random@domestic'
local put_anim_name = 'pickup_low'

local carrying_boombox = false

local function nearbyBoombox()
    local playerCoords = GetEntityCoords(cache.ped)
    local objects = GetGamePool('CObject')
    for _, object in ipairs(objects) do
        if GetEntityModel(object) == boomboxModel and #(playerCoords - GetEntityCoords(object)) < 3.0 then
            return object
        end
    end
    return false
end

---@param entity number
---@param timeoutMs? number
---@return boolean
local function ensureEntityNetworked(entity, timeoutMs)
    if not entity or entity == 0 or not DoesEntityExist(entity) then return false end

    local deadline = GetGameTimer() + (timeoutMs or 4000)
    SetEntityAsMissionEntity(entity, true, true)

    if not NetworkGetEntityIsNetworked(entity) then
        NetworkRegisterEntityAsNetworked(entity)
    end

    while GetGameTimer() < deadline do
        if not DoesEntityExist(entity) then return false end

        if not NetworkGetEntityIsNetworked(entity) then
            NetworkRegisterEntityAsNetworked(entity)
            Wait(50)
            goto continue
        end

        local netId = NetworkGetNetworkIdFromEntity(entity)
        if not netId or netId == 0 then
            Wait(50)
            goto continue
        end

        SetNetworkIdCanMigrate(netId, true)
        SetNetworkIdExistsOnAllMachines(netId, true)
        NetworkSetNetworkIdDynamic(netId, false)

        if NetworkDoesNetworkIdExist(netId) then
            return true
        end

        Wait(50)
        ::continue::
    end

    return DoesEntityExist(entity)
        and NetworkGetEntityIsNetworked(entity)
        and NetworkDoesNetworkIdExist(NetworkGetNetworkIdFromEntity(entity))
end

---@param entity number
local function deleteBoomboxEntity(entity)
    if not entity or entity == 0 or not DoesEntityExist(entity) then return end
    SetEntityAsMissionEntity(entity, true, true)
    DeleteEntity(entity)
    if DoesEntityExist(entity) then
        DeleteObject(entity)
    end
end

---@param entity number
---@return boolean
local function takeEntityOwnership(entity)
    if not DoesEntityExist(entity) then return false end
    if not ensureEntityNetworked(entity, 2000) then return false end
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
    if not NetworkGetEntityIsNetworked(currentBoombox) then
        if not ensureEntityNetworked(currentBoombox, 2000) then
            Warning('Boombox is not networked')
            Notification(i18n.t('boombox.create.not_networked'), 'error')
            return
        end
    end
    local netId = NetworkGetNetworkIdFromEntity(currentBoombox)
    radioSettings.id = netId
    audioplayer:open(radioSettings, {
        onPlay = function(soundId)
            if not DoesEntityExist(currentBoombox) then
                audioplayer:destroySound()
                return
            end
            local volume = audioplayer:getPlayer().volume
            TriggerServerEvent('mx-audioplayer:attach', soundId, NetworkGetNetworkIdFromEntity(currentBoombox), volume)
        end,
        onLogin = function(_, _, token)
            Entity(currentBoombox).state:set('audioplayer_account', token, true)
        end,
        onLogout = function(_, _)
            Entity(currentBoombox).state:set('audioplayer_account', nil, true)
        end,
        autoLogin = function(_, _, token)
            local entity = Entity(currentBoombox)
            if not entity.state.audioplayer_account then
                return
            end
            local account = entity.state.audioplayer_account
            local success = Login({
                token = account
            })
            if not success then
                if ShouldReportDeadToken(account) then
                    Notification(i18n.t('login.this_user_credentials_has_been_modified'), 'error')
                end
                entity.state:set('audioplayer_account', nil, true)
            end
        end
    })
end

---@return number|false
local function spawnNetworkedBoombox(coords, heading)
    local object = CreateObject(boomboxModel, coords.x, coords.y, coords.z, true, true, false)
    if not object or object == 0 then return false end

    local spawnDeadline = GetGameTimer() + 2000
    while not DoesEntityExist(object) and GetGameTimer() < spawnDeadline do
        Wait(0)
    end

    if not DoesEntityExist(object) then return false end

    SetEntityAsMissionEntity(object, true, true)
    PlaceObjectOnGroundProperly(object)
    SetEntityHeading(object, heading)

    if ensureEntityNetworked(object, 4000) then
        return object
    end

    deleteBoomboxEntity(object)
    return false
end

local function create()
    local boombox = nearbyBoombox()
    if boombox then
        TriggerServerEvent('mx-audioplayer:boombox:createFailed')
        Notification(i18n.t('boombox.create.already_nearby'), 'error')
        return
    end

    local ped = cache.ped
    local playerCoords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    lib.requestModel(boomboxModel)

    local object = spawnNetworkedBoombox(playerCoords, heading)
    if not object then
        Wait(150)
        object = spawnNetworkedBoombox(playerCoords, heading)
    end

    SetModelAsNoLongerNeeded(boomboxModel)

    if not object then
        TriggerServerEvent('mx-audioplayer:boombox:createFailed')
        Notification(i18n.t('boombox.create.not_networked'), 'error')
        return
    end

    lib.requestAnimDict(put_anim_dict)
    TaskPlayAnim(ped, put_anim_dict, put_anim_name, 8.0, -8.0, -1, 0, 0, false, false, false)
    Wait(200)
    PlaceObjectOnGroundProperly(object)
    StopAnimTask(ped, put_anim_dict, put_anim_name, 3.0)
    RemoveAnimDict(put_anim_dict)

    if not ensureEntityNetworked(object, 2000) then
        deleteBoomboxEntity(object)
        TriggerServerEvent('mx-audioplayer:boombox:createFailed')
        Notification(i18n.t('boombox.create.not_networked'), 'error')
        return
    end

    TriggerServerEvent('mx-audioplayer:boombox:createSuccess')
end

RegisterNetEvent('mx-audioplayer:boombox:create', create)

local function carryAnim()
    local ped = cache.ped
    if not takeEntityOwnership(ped) then return end
    lib.requestAnimDict(carry_anim_dict)
    while carrying_boombox do
        if IsEntityPlayingAnim(cache.ped, carry_anim_dict, carry_anim_name, 3) then goto continue end
        TaskPlayAnim(ped, carry_anim_dict, carry_anim_name, 8.0, -8.0, -1, 51, 0, false, false, false)
        ::continue::
        Wait(500)
    end
    StopAnimTask(ped, carry_anim_dict, carry_anim_name, 3.0)
    RemoveAnimDict(carry_anim_dict)
end

local function drop()
    local player = cache.ped
    local playerCoords = GetEntityCoords(player)
    local boombox = nearbyBoombox()
    if not boombox then return end
    if not takeEntityOwnership(boombox) then return end
    carrying_boombox = false
    DetachEntity(boombox, true, true)
    SetEntityCoords(boombox, playerCoords.x, playerCoords.y, playerCoords.z - 0.95, true, true, true, true)
    SetEntityAsMissionEntity(boombox, true, true)
    lib.requestAnimDict(put_anim_dict)
    TaskPlayAnim(player, put_anim_dict, put_anim_name, 8.0, -8.0, -1, 0, 0, false, false, false)
    Wait(500)
    PlaceObjectOnGroundProperly(boombox)
    RemoveAnimDict(carry_anim_dict)
end

local function pickup()
    local player = cache.ped
    local boombox = nearbyBoombox()
    if not boombox then return end
    if not takeEntityOwnership(boombox) then return end
    AttachEntityToEntity(boombox, player, GetPedBoneIndex(player, 24817), 0.0, 0.40, -0.0, -180.0, 90.0, 0.0, false, false, false, false, 2, true)
    carrying_boombox = true
    CreateThread(carryAnim)
    local text = i18n.t('boombox.drop.text')
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

if not Config.Boombox.Target then
    local nearbyBoombox = nil

    CreateThread(function()
        while true do
            local playerCoords = GetEntityCoords(cache.ped)
            local objects = GetGamePool('CObject')
            for _, object in ipairs(objects) do
                if GetEntityModel(object) == boomboxModel then
                    local objectCoords = GetEntityCoords(object)
                    local dst = #(playerCoords - objectCoords)
                    if dst < 2.0 then
                        nearbyBoombox = object
                        break
                    end
                end
            end
            Wait(500)
        end
    end)

    CreateThread(function()
        local openPickupStr = i18n.t('boombox.text.open_pickup')
        while true do
            local sleep = 1250
            if not carrying_boombox then
                local playerCoords = GetEntityCoords(cache.ped)
                if nearbyBoombox then
                    local boomboxCoords = GetEntityCoords(nearbyBoombox)
                    local dst = #(playerCoords - boomboxCoords)
                    if dst < 2.0 then
                        sleep = 0
                        DrawText3D(boomboxCoords.x, boomboxCoords.y, boomboxCoords.z + 0.2, openPickupStr)
                        if IsControlJustPressed(0, 38) then
                            openUi()
                        elseif IsControlJustPressed(0, 47) then
                            pickup()
                        end
                    end
                end
            end
            Wait(sleep)
        end
    end)
end

if Config.Boombox.Target then
    Info('Boombox target is enabled')
    CreateThread(function()
        if GetResourceState('qb-target') == 'started' then
            exports['qb-target']:AddTargetModel(boomboxModel, {
                options = {
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('boombox.target.open'),
                        action = function()
                            openUi()
                        end
                    },
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('boombox.target.pickup'),
                        action = function()
                            pickup()
                        end
                    },
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('boombox.target.destroy'),
                        action = function()
                            destroy()
                        end
                    }
                },
                distance = 2.5
            })
        else
            exports['qtarget']:AddTargetModel(boomboxModel, {
                options = {
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('boombox.target.open'),
                        action = function()
                            openUi()
                        end
                    },
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('boombox.target.pickup'),
                        action = function()
                            pickup()
                        end
                    },
                    {
                        icon = 'fas fa-music',
                        label = i18n.t('boombox.target.destroy'),
                        action = function()
                            destroy()
                        end
                    }
                },
                distance = 2.5
            })
        end
    end)
end
