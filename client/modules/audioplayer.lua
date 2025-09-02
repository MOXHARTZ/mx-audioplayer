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
    local uiDisabled = lib.callback.await('mx-audioplayer:isUiDisabled', 0, id)
    if uiDisabled then
        Notification(i18n.t('general.ui_disabled'), 'error')
        return true
    end
    return false
end

---@param options AudioPlayerOptions
function audioplayer:getInfo(options)
    self.id = options.id or ''
    self.options = nil
    self:initOptions(options)
    local id = self.id
    local data = lib.callback.await('mx-audioplayer:getData', 0, id) ---@type {playlist?: table, user?: Account, player: Player} | nil
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
    options = options or {}
    self:getInfo(options)

    local soundData, player = self:getSoundData(), self:getPlayer()
    if self.playlist and soundData then
        local track = table.find(self.playlist, function(v)
            return v.id == soundData.id
        end)
        if track then
            self:updatePlayerData({
                duration = Surround:getMaxDuration(player.soundId)
            })
            Surround:onTimeUpdate(player.soundId, self.onTimeUpdate)
        end
    end

    local id = self.id
    if not id then return end
    self.handlers = handlers or {}

    SendReactMessage('open', {
        playlist = self.playlist,
        currentSound = soundData,
        user = self.user,
        player = player
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
end

---@param player Player
function audioplayer:setPlayerData(player)
    if not player or player?.id ~= self.player?.id then
        self:destroySoundHandlers()
    end
    self.player = player
    self:initSoundHandlers()
end

function audioplayer:destroySoundHandlers()
    local player = self:getPlayer()
    if not player.soundId then return end
    Surround:onTimeUpdate(player.soundId, nil)
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
    Surround:onTimeUpdate(player.soundId, function(soundData)
        self:onTimeUpdate(soundData)
    end)
end

---@param options? AudioPlayerOptions
function audioplayer:initOptions(options)
    self.options = options
    if not options then
        return
    end
    if options.staySameCoords then
        self.options.coords = PlayerCoords
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
end

function audioplayer:destroySound()
    local id, player = self.id, self:getPlayer()
    if not player then return end
    TriggerServerEvent('mx-audioplayer:sync', id, 'destroy', {
        soundId = player.soundId
    })
end

function audioplayer:onDestroyed()
    self:triggerListener('onClose')
    self:updatePlayerData({
        soundData = nil
    })
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
    CreateThread(function()
        while self.shortDisplay.visible do
            -- shift arrow right
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 175) then
                SendReactMessage('nextSong')
            end
            -- shift arrow left
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 174) then
                SendReactMessage('previousSong')
            end
            -- shift k
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 311) then
                SendReactMessage('togglePlay')
            end
            -- shift arrow up
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 172) then
                SendReactMessage('volumeUp')
            end
            -- shift arrow down
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 173) then
                SendReactMessage('volumeDown')
            end
            Wait(0)
        end
    end)
end

---@param state boolean
---@param data? ShortDisplay Not necessary if state is false
function audioplayer:toggleShortDisplay(state, data)
    data = data or {}
    if state then
        self.shortDisplay = data or {}
        self:getInfo(data)
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

exports('toggleShortDisplay', audioplayer.toggleShortDisplay)

RegisterNetEvent('mx-audioplayer:destroy', function(audioplayerId)
    local id = audioplayer.id
    if not id or id ~= audioplayerId then return end
    audioplayer:onDestroyed()
end)
