---@class AudioPlayer
---@field id string
---@field soundId? string | number
---@field invokingResource string
---@field data {playlist: table, user: Account | nil, player: Player}
---@field options? AudioPlayerOptions
---@field handlers? OpenAudioPlayerHandlers
---@field shortDisplay? ShortDisplay
local audioplayer = {}

function audioplayer:checkUiDisabled()
    local id = self:getId()
    if not id or id == '' then
        Debug('audioplayer:checkUiDisabled forced to false because no id')
        return false
    end
    local uiDisabled = lib.callback.await('mx-audioplayer:isUiDisabled', 0, id)
    if uiDisabled then
        Notification(i18n.t('general.ui.disabled'), 'error')
        return false
    end
    return true
end

---@param options AudioPlayerOptions
function audioplayer:getInfo(options)
    if self.id then
        Debug('AudioPlayer already initialized, destroying previous instance')
        self:destroy()
    end
    self.id = options.id or ''
    self.invokingResource = GetInvokingResource()
    self.options = nil
    if self:checkUiDisabled() then return end
    self:initOptions(options)
    local id = self:getId()
    local playerData = lib.callback.await('mx-audioplayer:getData', 0, id)
    Debug('getInfo ::: playerData', playerData)
    self.data = playerData
end

---@param options? AudioPlayerOptions
---@param handlers? OpenAudioPlayerHandlers
function audioplayer:open(options, handlers)
    options = options or {}
    self:getInfo(options)
    if not self.data then return Error('Error getting audio player info') end
    local soundData = self.data.player and self.data.player.soundData
    if soundData and self.data.playlist then
        local track = table.find(self.data.playlist, function(v)
            return v.id == soundData.id
        end)
        if track then
            soundData.duration = Surround:getMaxDuration(self.soundData.soundId)
            Surround:onTimeUpdate(self.soundData.soundId, self.onTimeUpdate)
        end
    end
    local id = self:getId()
    Debug('OpenAudioPlayer ::: id', id, 'playlist', self.data.playlist)
    handlers = handlers or {}
    if not id then
        return Debug('Error getting audio player info')
    end
    self.handlers = handlers
    SendReactMessage('open', {
        playlist = self.data.playlist,
        currentSound = soundData,
        user = self.data.user,
        volume = soundData and soundData.volume or AudioVolume,
    })
    self:triggerListener('onOpen')
    SetNuiFocus(true, true)
    TriggerServerEvent('mx-audioplayer:disableUi', id, true)
end

function audioplayer:setSoundData(soundData)
    Debug('setSoundData ::: self.data', self.data)
    self.data.player.soundData = soundData
    self:initSoundHandlers()
end

function audioplayer:setData(data)
    self.data = data
end

function audioplayer:initSoundHandlers()
    if not self.soundId then
        return
    end
    -- Surround:onPlayEnd(self.soundId, self.onEnd)
    -- Surround:onDestroy(self.soundId, self.onDestroyed)
    Surround:onTimeUpdate(self.soundId, self.onTimeUpdate)
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
    if self.handlers[listenerName] then
        self.handlers[listenerName](self.soundData, ...)
    end
end

function audioplayer:destroy()
    Debug('AudioPlayer destroyed')
    self.id = nil
    self.invokingResource = nil
end

function audioplayer:onTimeUpdate(soundData)
    SendNUIMessage({
        action = 'timeUpdate',
        data = {
            time = math.floor(soundData.currentTime),
        }
    })
end

function audioplayer:onDestroyed()
    self:triggerListener('onClose')
    self.soundData = nil
    SendNUIMessage({
        action = 'destroyed'
    })
end

function audioplayer:onEnd()
    SendNUIMessage({
        action = 'end'
    })
end

---@return string Returns current audioplayer id based on invoking resource and custom id
function audioplayer:getId()
    if not self.invokingResource or not self.id then
        return ''
    end
    return self.invokingResource .. self.id
end

function audioplayer:shortDisplayKeyListener()
    CreateThread(function()
        while self.shortDisplay.state do
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
    self.shortDisplay = data or {}
    self.shortDisplay.state = state
    if not state then
        SendReactMessage('toggleShortDisplay', {
            state = state
        })
        return
    end
    data = data or {}
    self:getInfo(data)
    if not self.data then return Debug('ToggleShortDisplay ::: Error getting audio player info') end
    SendReactMessage('toggleShortDisplay', {
        state = state,
        playlist = self.data.playlist,
        currentSound = self.data.player.soundData
    })
    self:shortDisplayKeyListener()
    Debug('Short display toggled', state, 'data', data)
end

exports('toggleShortDisplay', audioplayer.toggleShortDisplay)

RegisterNetEvent('mx-audioplayer:playEnd', function(audioplayerId)
    Debug('mx-audioplayer:playEnd ::: id', audioplayerId)
    local id = audioplayer:getId()
    if not id or id ~= audioplayerId then return end
    audioplayer:onEnd()
    Debug('mx-audioplayer:playEnd ::: onEnd')
end)

RegisterNetEvent('mx-audioplayer:destroy', function(audioplayerId)
    Debug('mx-audioplayer:destroy ::: id', audioplayerId)
    local id = audioplayer:getId()
    if not id or id ~= audioplayerId then return end
    audioplayer:onDestroyed()
    Debug('mx-audioplayer:destroy ::: onDestroyed')
end)

return audioplayer
