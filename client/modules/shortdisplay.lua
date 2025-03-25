local function shortDisplayKeyListener()
    CreateThread(function()
        while ShortDisplayData.state do
            -- shift arrow right
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 175) then
                SendNUIMessage({
                    action = 'nextSong'
                })
            end
            -- shift arrow left
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 174) then
                SendNUIMessage({
                    action = 'previousSong'
                })
            end
            -- shift k
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 311) then
                SendNUIMessage({
                    action = 'togglePlay'
                })
            end
            -- shift arrow up
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 172) then
                SendNUIMessage({
                    action = 'volumeUp'
                })
            end
            -- shift arrow down
            if IsControlPressed(0, 21) and IsControlJustPressed(0, 173) then
                SendNUIMessage({
                    action = 'volumeDown'
                })
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
        SendNUIMessage({
            action = 'toggleShortDisplay',
            data = {
                state = state,
            }
        })
        return
    end
    data = data or {}
    local _playlist, id = GetAudioPlayerInfo({ customId = data.customId })
    if not _playlist or not id then return Debug('ToggleShortDisplay ::: Error getting audio player info') end
    SendNUIMessage({
        action = 'toggleShortDisplay',
        data = {
            state = state,
            playlist = _playlist,
            currentSound = CurrentSounds[id]
        }
    })
    shortDisplayKeyListener()
    Debug('Short display toggled', state, 'data', data)
end

exports('toggleShortDisplay', ToggleShortDisplay)
