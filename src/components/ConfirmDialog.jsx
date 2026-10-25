import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { tr } from '../lib/i18n.jsx'

// Pengganti window.confirm(): dialog bawaan browser diblokir diam-diam di sebagian WebView dan
// browser dalam aplikasi, sehingga tombol Hapus tampak tidak berfungsi.
const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setReq(opts)
      }),
    []
  )

  const close = useCallback((answer) => {
    resolver.current?.(answer)
    resolver.current = null
    setReq(null)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {req && <Dialog {...req} onAnswer={close} />}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}

function Dialog({ title, body, confirmLabel = tr('Ya, lanjutkan', 'Yes, continue'), danger = false, onAnswer }) {
  const okRef = useRef(null)
  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onAnswer(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAnswer])

  return (
    <div className="dialog-backdrop" onClick={() => onAnswer(false)}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="dialog-title">{title}</h2>
        {body && <p>{body}</p>}
        <div className="dialog-actions">
          <button className="btn" onClick={() => onAnswer(false)}>{tr('Batal', 'Cancel')}</button>
          <button ref={okRef} className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`} onClick={() => onAnswer(true)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
