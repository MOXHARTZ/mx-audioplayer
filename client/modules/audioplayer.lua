local IsControlPressed = IsControlPressed
local IsControlJustPressed = IsControlJustPressed

local DEFAULT_PLAYER = {
    volume = 1,
    playing = false,
    repeatState = false,
    shuffle = false
}

---@class AudioPlayer
---@field visible boolean
---@field id string
---@field player? Player
---@field user? Account | nil
---@field playlist? PlaylistData[]
---@field options? AudioPlayerOptions
---@field handlers? OpenAudioPlayerHandlers
---@field shortDisplay? ShortDisplay
_G['audioplayer'] = {
    shortDisplay = {},
    player = DEFAULT_PLAYER
}

function audioplayer:isUIDisabled()
    local id = self.id
    if not id or id == '' then
        return false
    end
    local uiDisabled = lib.callback.await('mx-audioplayer:isUiDisabled', false, id)
    if uiDisabled then
        Notification(i18n.t('general.ui_disabled'), 'error')
        return true
    end
    if Config.EnableAccountSharing then return false end
    local hasAccess = lib.callback.await('mx-audioplayer:hasAccess', false, id)
    if not hasAccess then
        Notification(i18n.t('general.account_sharing_disabled'), 'info')
        return true
    end
    return false
end

---@param options AudioPlayerOptions
function audioplayer:getInfo(options)
    local incoming = options.id
    self.id = (incoming ~= nil and incoming ~= '' and incoming) or self.id or ''
    self.options = nil
    self:initOptions(options)
    local id = self.id
    local data = lib.callback.await('mx-audioplayer:getData', 0, id)
    if self.player?.id ~= data?.player?.id then
        self:destroySoundHandlers()
    end
    self.player = data?.player
    self.user = data?.user
    self.playlist = data?.playlist
    self:initSoundHandlers()
end

---@param options? AudioPlayerOptions
---@param handlers? OpenAudioPlayerHandlers
function audioplayer:open(options, handlers)
    if self:isUIDisabled() then return end
    self.visible = true

    self:toggleShortDisplay(false)
    options = options or {}
    self:getInfo(options)

    local soundData, player = self:getSoundData(), self:getPlayer()
    if player.soundId and soundData and soundData.soundId then
        self:updatePlayerData({
            duration = Sound:getMaxDuration(player.soundId)
        })
    end

    local id = self.id
    if not id or id == '' then
        return Error('audioplayer:open ::: no audioplayer id; pass one in options.id')
    end
    self.handlers = handlers or {}

    local accounts = lib.callback.await('mx-audioplayer:getUserAccounts', false)
    SendReactMessage('open', {
        playlist = self.playlist,
        currentSound = soundData,
        user = self.user,
        player = player,
        accounts = accounts
    })
    TriggerServerEvent('mx-audioplayer:setHandlers', id, handlers)

    self:triggerListener('onOpen')
    SetNuiFocus(true, true)
    TriggerServerEvent('mx-audioplayer:disableUi', id, true)
end

function audioplayer:setPlaylist(playlist)
    self.playlist = playlist
    SendReactMessage('setPlaylist', self.playlist)
end

function audioplayer:close()
    self.visible = false
    local id = self.id
    SetNuiFocus(false, false)
    audioplayer:triggerListener('onClose')
    TriggerServerEvent('mx-audioplayer:disableUi', id, false)

    if self.settings?.minimalHud then
        self:toggleShortDisplay(true, {
            id = id,
            vehicle = cache.vehicle,
        })
    end
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if audioplayer.visible and audioplayer.id then
        TriggerServerEvent('mx-audioplayer:disableUi', audioplayer.id, false)
    end
end)

local SETTINGS_KVP <const> = 'mx_audioplayer_settings'

audioplayer.settings = {}

function audioplayer:loadSettings()
    local raw = GetResourceKvpString(SETTINGS_KVP)
    if not raw then return end
    local ok, decoded = pcall(json.decode, raw)
    if ok and type(decoded) == 'table' then
        self.settings = decoded
    end
end

---@param data Settings
function audioplayer:applySettings(data)
    self.settings = type(data) == 'table' and data or {}
end

---@return Settings
function audioplayer:getSettings()
    return self.settings or {}
end

audioplayer:loadSettings()

local Fades = {}
local fadeToken = 0

local function clampFade(value, fallback)
    if type(value) ~= 'number' then return fallback end
    return math.max(0.0, math.min(value, 8.0))
end

---@return number
function audioplayer:fadeOutSeconds()
    if not Config.Fade.Enable then return 0.0 end
    if Config.Fade.AllowPlayerOverride then
        return clampFade(self:getSettings().fadeOut, Config.Fade.Out)
    end
    return Config.Fade.Out
end

---@return number
function audioplayer:fadeInSeconds()
    if not Config.Fade.Enable then return 0.0 end
    if Config.Fade.AllowPlayerOverride then
        return clampFade(self:getSettings().fadeIn, Config.Fade.In)
    end
    return Config.Fade.In
end

---@param soundId string
---@param factor number
local function applyFadeVolume(soundId, factor)
    local base = audioplayer:getPlayer().volume or 1
    Sound:setVolumeMax(soundId, base * math.max(0.0, math.min(1.0, factor)), true)
end

---@param soundId? string
---@param restore? boolean
function audioplayer:cancelFade(soundId, restore)
    if not soundId or not Fades[soundId] then return end
    Fades[soundId] = nil
    if restore and Sound:soundExists(soundId) then
        applyFadeVolume(soundId, 1.0)
    end
end

---@param soundId string
---@param dir 'in' | 'out'
---@param duration number seconds
local function runFade(soundId, dir, duration)
    if duration <= 0 then return end
    fadeToken = fadeToken + 1
    local token = fadeToken
    Fades[soundId] = { dir = dir, token = token }

    local step = math.max(80, Config.Fade.StepMs or 100)
    local curve = Config.Fade.Curve or 1.5
    local totalMs = duration * 1000

    CreateThread(function()
        applyFadeVolume(soundId, dir == 'in' and 0.0 or 1.0)
        local elapsed = 0
        while true do
            Wait(step)
            local fade = Fades[soundId]
            if not fade or fade.token ~= token then return end
            if not Sound:soundExists(soundId) or audioplayer:getPlayer().soundId ~= soundId then
                Fades[soundId] = nil
                return
            end
            if Sound:isPaused(soundId) then
                audioplayer:cancelFade(soundId, true)
                return
            end

            elapsed = elapsed + step
            local progress = math.min(1.0, elapsed / totalMs)
            applyFadeVolume(soundId, dir == 'in' and progress ^ curve or (1.0 - progress) ^ curve)

            if progress >= 1.0 then
                Fades[soundId] = nil
                if dir == 'in' then applyFadeVolume(soundId, 1.0) end
                return
            end
        end
    end)
end

---@param soundId? string
function audioplayer:beginFadeIn(soundId)
    if not soundId or not Sound:soundExists(soundId) then return end
    local fadeIn = self:fadeInSeconds()
    if fadeIn <= 0 then return end
    local active = Fades[soundId]
    if active and active.dir == 'in' then return end
    runFade(soundId, 'in', fadeIn)
end

---@param soundId? string
function audioplayer:armFadeIn(soundId)
    if not soundId or self:fadeInSeconds() <= 0 then return end
    CreateThread(function()
        local deadline = GetGameTimer() + 2000
        while GetGameTimer() < deadline do
            if self:getPlayer().soundId ~= soundId then return end
            if Sound:soundExists(soundId) then
                return self:beginFadeIn(soundId)
            end
            Wait(50)
        end
    end)
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    for soundId in pairs(Fades) do
        Fades[soundId] = nil
        if Sound:soundExists(soundId) then
            Sound:setVolumeMax(soundId, audioplayer:getPlayer().volume or 1, true)
        end
    end
end)

---@param player Player
function audioplayer:setPlayerData(player)
    if not player or player?.id ~= self.player?.id then
        self:destroySoundHandlers()
    end
    local previousSoundId = self.player?.soundId
    if previousSoundId and previousSoundId ~= player?.soundId then
        self:cancelFade(previousSoundId)
    end
    self.player = player
    self:initSoundHandlers()
    self:armFadeIn(player?.soundId)
end

function audioplayer:destroySoundHandlers()
    local player = self:getPlayer()
    if not player.soundId then return end
    self:cancelFade(player.soundId)
    Sound:onTimeUpdate(player.soundId, nil)
    Sound:onPlayStart(player.soundId, nil)
end

---@param data Player
function audioplayer:updatePlayerData(data)
    if not data then return end
    if not self.player then self.player = DEFAULT_PLAYER end
    for k, v in pairs(data) do
        self.player[k] = v
    end
end

function audioplayer:initSoundHandlers()
    local player = self:getPlayer()
    if not player.soundId then
        return
    end
    Sound:onTimeUpdate(player.soundId, function(soundData)
        self:onTimeUpdate(soundData)
    end)
    Sound:onPlayStart(player.soundId, function()
        self:beginFadeIn(player.soundId)
    end)
end

---@param options? AudioPlayerOptions
function audioplayer:initOptions(options)
    self.options = options
    if not options then
        return
    end
    if options.staySameCoords then
        self.options.coords = GetEntityCoords(cache.ped)
    end
    if options.panner then
        self.options.panner = options.panner
    end
    if options.maxDistance then
        self.options.maxDistance = options.maxDistance
    end
end

---@param listenerName string
function audioplayer:triggerListener(listenerName, ...)
    if not self.handlers then return end
    local player, soundData = self:getPlayer(), self:getSoundData()
    if self.handlers[listenerName] then
        self.handlers[listenerName](player.soundId, soundData, ...)
    end
end

function audioplayer:onTimeUpdate(soundData)
    SendNUIMessage({
        action = 'timeUpdate',
        data = {
            time = math.floor(soundData.currentTime),
        }
    })

    local soundId = self:getPlayer().soundId
    if not soundId then return end
    local maxDuration = soundData.maxDuration
    if not maxDuration or maxDuration <= 0 then return end

    local fadeOut = self:fadeOutSeconds()
    if fadeOut <= 0 then return end
    fadeOut = math.min(fadeOut, maxDuration * 0.5)

    local remaining = maxDuration - (soundData.currentTime or 0)
    local active = Fades[soundId]
    if active then
        if active.dir == 'out' and remaining > fadeOut + 1.0 then
            self:cancelFade(soundId, true)
        end
        return
    end

    if remaining > 0 and remaining <= fadeOut then
        runFade(soundId, 'out', remaining)
    end
end

function audioplayer:destroySound()
    local id, player = self.id, self:getPlayer()
    if not player or not player.soundId then return end
    TriggerServerEvent('mx-audioplayer:sync', id, 'destroy', {
        soundId = player.soundId
    })
    self:destroySoundHandlers()
    if self.player then
        self.player.playing = false
        self.player.soundData = nil
        self.player.soundId = nil
    end
end

function audioplayer:onDestroyed()
    self:triggerListener('onClose')
    if self.player then
        self.player.playing = false
        self.player.soundData = nil
        self.player.soundId = nil
    end
    if self.visible then
        SendNUIMessage({
            action = 'destroyed'
        })
    end
end

function audioplayer:onEnd(playlist, position)
    SendNUIMessage({
        action = 'end',
        data = {
            playlist = playlist,
            position = position
        }
    })
end

function audioplayer:getSoundData()
    return self.player?.soundData or {}
end

function audioplayer:getPlayer()
    return self.player or DEFAULT_PLAYER
end

function audioplayer:shortDisplayKeyListener()
    if self.shortDisplayThread then return end
    self.shortDisplayThread = true

    CreateThread(function()
        while self.shortDisplay.visible do
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 175) then
                SendReactMessage('nextSong')
            end
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 174) then
                SendReactMessage('previousSong')
            end
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 311) then
                SendReactMessage('togglePlay')
            end
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 172) then
                SendReactMessage('volumeUp')
            end
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 173) then
                SendReactMessage('volumeDown')
            end
            Wait(0)
        end
        self.shortDisplayThread = nil
    end)
end

---@param state boolean
---@param data? ShortDisplay Not necessary if state is false
function audioplayer:toggleShortDisplay(state, data)
    data = data or {}
    if state then
        if data.id == '' then data.id = nil end
        data.id = data.id or self.id
        local switching = data.id ~= self.id
        self.shortDisplay = data

        if switching then
            self:getInfo(data)
        end
    end
    if not self.player then return end

    self.shortDisplay.visible = state
    if not state then
        SendReactMessage('toggleShortDisplay', {
            state = state
        })
        return
    end

    SendReactMessage('toggleShortDisplay', {
        state = state,
        playlist = self.playlist,
        currentSound = self:getSoundData(),
        player = self.player
    })

    self:shortDisplayKeyListener()
end

exports('toggleShortDisplay', function(state, data)
    return audioplayer:toggleShortDisplay(state, data)
end)

RegisterNetEvent('mx-audioplayer:destroy', function(audioplayerId)
    local id = audioplayer.id
    if not id or id ~= audioplayerId then return end
    audioplayer:onDestroyed()
end)
