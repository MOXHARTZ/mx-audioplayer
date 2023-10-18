import { useEffect, useState } from 'react'
import { IN_DEVELOPMENT, NOTIFICATION } from '@/utils/misc'
import Header from './components/header'
import Playlist from './components/playlist'
import Actions from './components/actions'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Backdrop, CircularProgress } from '@mui/material'
import { useAppDispatch, useAppSelector } from './stores'
import useNuiEvent from './hooks/useNuiEvent'
import { useExitListener } from './hooks/useExitListener'
import { fetchNui } from './utils/fetchNui'
import { motion } from "framer-motion"
import { setPlaylist } from './stores/Main'
import { Song } from './fake-api/song'


function App() {
  const waitingForResponse = useAppSelector(state => state.Main.waitingForResponse)
  const [visible, setVisible] = useState(IN_DEVELOPMENT);
  console.log('visible', visible)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!IN_DEVELOPMENT) return;
    document.body.style.backgroundImage = 'url(https://wallpaperaccess.com/full/707055.jpg)'
  }, [])
  useNuiEvent('open', () => {
    setVisible(true)
  })
  useEffect(() => {
    if (IN_DEVELOPMENT) return;
    (async () => {
      const _playlist: Song[] = await fetchNui('getPlaylist')
      dispatch(setPlaylist(_playlist))
    })()
  }, [])
  useExitListener(() => {
    setVisible(false)
    fetchNui('close')
  })
  return (
    <>
      <ToastContainer {...NOTIFICATION} />
      <motion.main
        key='app'
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 1.1,
        }}
        initial={{
          opacity: 0,
          scale: 1.1,
        }}
        transition={{
          duration: 0.3
        }}
        exit={{
          opacity: 0,
          scale: 1.1,
        }} className='flex items-center justify-center w-full h-full'>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={waitingForResponse}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <section className='sm:w-[80vh] md:w-[100vh] xl:w-[120vh] p-6 bg-zinc-700 rounded-lg text-white'>
          <Header />
          <Actions />
          <Playlist />
        </section>
      </motion.main>
    </>

  )
}

export default App
