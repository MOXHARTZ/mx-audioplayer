import { useEffect, useState } from 'react'
import { NOTIFICATION, isEnvBrowser } from '@/utils/misc'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppDispatch } from './stores'
import useNuiEvent from './hooks/useNuiEvent'
import { useExitListener } from './hooks/useExitListener'
import { fetchNui } from './utils/fetchNui'
import { addPlaylist, clearSound, setPlaying, setPlaylist, setPosition } from './stores/Main'
import { Song } from './fake-api/song'
import classNames from 'classnames'
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ReadyListener } from './utils/types'
import router from './routes'
import { RouterProvider } from 'react-router-dom'
import { Playlist } from './fake-api/playlist-categories';
import { NextUIProvider } from '@nextui-org/react';

function App() {
  const [visible, setVisible] = useState(isEnvBrowser());
  const dispatch = useAppDispatch()
  useEffect(() => {
    fetchNui('uiReady')
    if (!isEnvBrowser()) return;
    document.body.style.backgroundImage = 'url(https://wallpaperaccess.com/full/707055.jpg)'
  }, [])
  useNuiEvent<{ playlist: Playlist[]; currentSound: Song }>('open', (data) => {
    setVisible(true)
    dispatch(setPlaylist(data.playlist))
    if (!data.currentSound) return dispatch(clearSound(true));
    dispatch(setPlaying(data.currentSound.playing ?? false))
    dispatch(setPosition(data.currentSound.id))
  })
  useNuiEvent('destroyed', () => {
    dispatch(clearSound(true));
  })
  useExitListener(() => {
    setVisible(false)
    fetchNui('close')
  })
  useNuiEvent<ReadyListener>('onUiReady', (data) => {
    i18n.use(initReactI18next).init({
      lng: data.languageName,
      resources: data.resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    })
  })
  useNuiEvent<Playlist>('receivePlaylist', (newPlaylist) => {
    if (!visible) return;
    dispatch(addPlaylist(newPlaylist))
  })

  return (
    <>
      <ToastContainer {...NOTIFICATION} />
      <main className={classNames({
        'flex items-center justify-center w-full h-full transition scale-100 dark': true,
        'opacity-0 scale-110': !visible
      })}>
        <NextUIProvider className='w-full h-full items-center flex justify-center'>
          <RouterProvider router={router} />
        </NextUIProvider>
      </main>
    </>

  )
}

export default App
