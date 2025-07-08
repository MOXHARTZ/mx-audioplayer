import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import store from './stores'
import { ToastProvider } from '@heroui/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider placement='top-center' />
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
