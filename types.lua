---@class OpenAudioPlayerData
---@field customId? string
---@field silent? boolean
---@field staySameCoords? boolean
---@field panner? {panningModel: string, refDistance: number, rolloffFactor: number, distanceModel: string}

-- Check mx-surround's types.lua for the types of the following functions
---@class OpenAudioPlayerHandlers
---@field onPlay? fun(sound)
---@field onPause? fun(sound)
---@field onResume? fun(sound)
---@field onVolumeChange? fun(sound)
---@field onSeek? fun(sound)
---@field onClose? fun(sound)

---@class Settings
---@field minimalHud boolean

---@class ShortDisplay
---@field state? boolean
---@field vehicle? number
---@field customId? string

---@class CreateAccount
---@field username string
---@field firstname string
---@field lastname string
---@field password string

---@class Account : CreateAccount
---@field id number
---@field creator string
---@field avatar? string

---@class UpdateProfile
---@field username string
---@field password string | number
---@field avatar? string

---@class AudioplayerAccount
---@field id string
---@field accountId number

---@class Playlist
---@field id number
---@field userId number
---@field data table
