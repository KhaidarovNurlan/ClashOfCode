import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info', // 'info', 'success', 'error'
  })

  const showToast = (message, type = 'info') => {
    setToast({
      visible: true,
      message,
      type,
    })
  }

  const hideToast = () => {
    setToast({
      ...toast,
      visible: false,
    })
  }

  const value = {
    toast,
    showToast,
    hideToast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}