local function shortDisplayKeyListener()
    CreateThread(function()
        while ShortDisplayData.state do
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
function ToggleShortDisplay(state, data)
    ShortDisplayData = data or {}
    ShortDisplayData.state = state
    if not state then
        SendReactMessage('toggleShortDisplay', {
            state = state
        })
        return
    end
    data = data or {}
    local playerData, id = GetAudioPlayerInfo(data)
    if not playerData or not id then return Debug('ToggleShortDisplay ::: Error getting audio player info') end
    SendReactMessage('toggleShortDisplay', {
        state = state,
        playlist = playerData.playlist,
        currentSound = CurrentSoundData
    })
    shortDisplayKeyListener()
    Debug('Short display toggled', state, 'data', data)
end

exports('toggleShortDisplay', ToggleShortDisplay)
