import { useEffect, useMemo, useRef, useState } from 'react'
import { NOTIFICATION, formattedTypes, isEnvBrowser, notification } from '@/utils/misc'
import { useAppDispatch, useAppSelector } from './stores'
import useNuiEvent from './hooks/useNuiEvent'
import { useExitListener } from './hooks/useExitListener'
import { fetchNui } from './utils/fetchNui'
import { addPlaylist, clearSound, setPlaying, setPlaylist, setSettings, setUserData, setVolume } from './stores/Main'
import { Song } from './fake-api/song'
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Account, ReadyListener } from './utils/types'
import router from './routes'
import { RouterProvider, useNavigate } from 'react-router-dom'
import { Playlist } from './fake-api/playlist-categories';
import { addToast, HeroUIProvider } from '@heroui/react';
import ShortDisplay from './components/shortdisplay';
import { AnimatePresence, motion } from "motion/react"
import { nextSongThunk } from './thunks/nextSong';
import { setPositionThunk } from './thunks/setPosition'


function App() {
  const [visible, setVisible] = useState(isEnvBrowser());
  const [shortDisplay, setShortDisplay] = useState(false)
  const dispatch = useAppDispatch()
  const { settings, playing, repeat, playlist, currentSongData } = useAppSelector(state => state.Main)
  const currentSongChildren = useMemo(() => playlist?.find(playlist => playlist.id === currentSongData?.playlistId)?.songs, [playlist, currentSongData])
  const closeUI = () => {
    setVisible(false)
    fetchNui('close')
  }
  useEffect(() => {
    fetchNui('uiReady')
    if (!isEnvBrowser()) return;
    document.body.style.backgroundImage = 'url(https://wallpaperaccess.com/full/707055.jpg)'
  }, [])
  useNuiEvent<{ playlist: Playlist[]; currentSound: Song; user?: Account; volume: number }>('open', (data) => {
    setVisible(true)
    dispatch(setVolume(data.volume))
    dispatch(setPlaylist(data.playlist))
    dispatch(setUserData(data.user))
    if (!data.currentSound) {
      return dispatch(clearSound(true));
    }
    dispatch(setPlaying(data.currentSound.playing ?? false))
    dispatch(setPositionThunk(data.currentSound))
  })
  useNuiEvent<{ state: boolean, playlist: Playlist[]; currentSound?: Song }>('toggleShortDisplay', (data) => {
    setShortDisplay(data.state)
    if (!data.state) return;
    dispatch(setPlaylist(data.playlist))
    if (!data.currentSound) {
      dispatch(clearSound(true));
      return;
    }
    dispatch(setPlaying(data.currentSound.playing ?? false))
    dispatch(setPositionThunk(data.currentSound))
  })
  useNuiEvent('destroyed', () => {
    dispatch(clearSound(true));
  })
  useNuiEvent('clearSound', () => {
    dispatch(clearSound(true))
    dispatch(setPlaylist([]))
  })
  useExitListener(() => closeUI())
  useNuiEvent<ReadyListener>('onUiReady', (data) => {
    i18n.use(initReactI18next).init({
      lng: data.languageName,
      resources: data.resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    })
    dispatch(setSettings(data.settings))
  })
  useNuiEvent<Playlist>('receivePlaylist', (newPlaylist) => {
    if (!visible) return;
    dispatch(addPlaylist(newPlaylist))
  })
  useNuiEvent('close', closeUI)
  useNuiEvent('end', () => {
    if (repeat) {
      fetchNui('seek', {
        position: 0
      })
      return
    }
    if (currentSongChildren?.length === 0) return;
    dispatch(nextSongThunk(true))
  })
  useNuiEvent<{ msg: string, type: keyof typeof formattedTypes }>('notification', (data) => {
    console.log(data)
    addToast({
      title: data.type.toUpperCase(),
      description: data.msg,
      color: formattedTypes[data.type],
      shouldShowTimeoutProgress: true,
      timeout: 3000,
      variant: 'flat',
    })
  })
  return (
    <>
      <ShortDisplay
        position={settings.minimalHudPosition}
        visible={!visible && settings.minimalHud && shortDisplay && playing}
      />
      <AnimatePresence>
        {visible && (
          <motion.main
            animate={{
              scale: 1,
              opacity: 1,
            }}
            initial={{
              opacity: 0,
              scale: 1.10,
            }}
            exit={{
              opacity: 0,
              scale: 1.10,
            }}
            transition={{
              duration: 0.3
            }}
            className='items-center justify-center w-full h-full dark'>
            <HeroUIProvider className='w-full h-full items-center flex justify-center'>
              <RouterProvider router={router} />
            </HeroUIProvider>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
