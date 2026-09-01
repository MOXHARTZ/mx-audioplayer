---@class AudioPlayerOptions
---@field id? string
---@field silent? boolean
---@field staySameCoords? boolean
---@field maxDistance? number
---@field panner? {panningModel: string, refDistance: number, rolloffFactor: number, distanceModel: string}
---@field coords? vector3

---@class OpenAudioPlayerHandlers
---@field onPlay? fun(sound)
---@field onPause? fun(sound)
---@field onResume? fun(sound)
---@field onVolumeChange? fun(sound)
---@field onSeek? fun(sound)
---@field onClose? fun(sound)

---@class Settings
---@field minimalHud boolean
---@field fadeIn? number Seconds. nil falls back to Config.Fade.In
---@field fadeOut? number Seconds. nil falls back to Config.Fade.Out

---@class ShortDisplay
---@field visible? boolean
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
---@field isOwner boolean

---@class UpdateProfile
---@field username string
---@field password string | number
---@field avatar? string

---@class QueueEntry
---@field uid string Server minted. Songs can be queued twice, so ids are not unique
---@field song PlaylistSong
---@field playlistId string Playlist the entry came from. Playback continues there once it plays

---@class Player
---@field id? string
---@field soundId? string
---@field source? number
---@field playing? boolean
---@field volume? number
---@field soundData? PlaylistSong
---@field duration? number
---@field repeatState? boolean
---@field shuffle? boolean
---@field currentPlaylistId? string
---@field queue? QueueEntry[] Session only. Never persisted
---@field queueSeq? number
---@field playContext? {coords: vector3, options: AudioPlayerOptions} Needed to replay without the original closure

---@class AudioPlayerAccount
---@field id string
---@field accountId number
---@field player? Player
---@field creator string

---@class PlaylistData
---@field name string
---@field description string
---@field id string
---@field songs PlaylistSong[]

---@class Playlist
---@field id number
---@field userId number
---@field data PlaylistData[]

---@class PlaylistSong
---@field soundId string
---@field title string
---@field url string
---@field id string
---@field cover string
---@field artist string
---@field duration number
---@field isStream? boolean Endless radio stream. Never auto advances

---@class LoginData
---@field id? number
---@field token? string
---@field username? string
---@field password? number

---@class RadioStation
---@field id string
---@field title string
---@field artist string
---@field cover string
---@field url string Direct audio stream, not a YouTube link
