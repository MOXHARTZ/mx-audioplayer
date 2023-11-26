import { useEffect, useState } from 'react'
import { IN_DEVELOPMENT, NOTIFICATION } from '@/utils/misc'
import Header from './components/header'
import Playlist from './components/playlist'
import Actions from './components/actions'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Backdrop, CircularProgress, CssBaseline } from '@mui/material'
import { useAppDispatch, useAppSelector } from './stores'
import useNuiEvent from './hooks/useNuiEvent'
import { useExitListener } from './hooks/useExitListener'
import { fetchNui } from './utils/fetchNui'
import { clearSound, setPlaying, setPlaylist, setPosition } from './stores/Main'
import { Song } from './fake-api/song'
import classNames from 'classnames'


function App() {
  const waitingForResponse = useAppSelector(state => state.Main.waitingForResponse)
  const [visible, setVisible] = useState(IN_DEVELOPMENT);
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!IN_DEVELOPMENT) return;
    document.body.style.backgroundImage = 'url(https://wallpaperaccess.com/full/707055.jpg)'
  }, [])
  useNuiEvent<{ playlist: Song[]; currentSound: Song }>('open', (data) => {
    setVisible(true)
    dispatch(setPlaylist(data.playlist))
    if (!data.currentSound) return dispatch(clearSound(true));
    dispatch(setPlaying(data.currentSound.playing ?? false))
    dispatch(setPosition(data.playlist.findIndex(song => song.id === data.currentSound.id)))
  })
  useExitListener(() => {
    setVisible(false)
    fetchNui('close')
  })
  return (
    <>
      <CssBaseline />
      <Backdrop
        sx={{ color: '#fff', zIndex: 9999 }}
        open={waitingForResponse && visible}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <ToastContainer {...NOTIFICATION} />
      <main className={classNames({
        'flex items-center justify-center w-full h-full transition scale-100': true,
        'opacity-0 scale-110': !visible
      })}>
        <section className='sm:w-[80vh] md:w-[100vh] xl:w-[120vh] p-6 bg-zinc-700 rounded-lg text-white'>
          <Header />
          <Actions />
          <Playlist />
        </section>
      </main>
    </>

  )
}

export default App
