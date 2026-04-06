import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'success' ? 'toast-success' : ''}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
