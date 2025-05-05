import React, { useState, useEffect } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

const Toast = () => {
  const { toast, hideToast } = useToast()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          hideToast()
          setIsExiting(false)
        }, 300)
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [toast.visible, hideToast])

  if (!toast.visible) return null

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      hideToast()
      setIsExiting(false)
    }, 300)
  }

  const getIconByType = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />
      default:
        return <Info className="text-blue-500" size={20} />
    }
  }

  const getBgColorByType = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div 
        className={`rounded-lg shadow-lg border p-4 max-w-md flex items-start ${getBgColorByType()}`}
      >
        <div className="flex-shrink-0 mr-3">
          {getIconByType()}
        </div>
        <div className="flex-1">
          <p className="text-white">{toast.message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="ml-4 text-slate-400 hover:text-white focus:outline-none"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default Toast