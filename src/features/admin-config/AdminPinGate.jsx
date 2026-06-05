import { useState, useRef, useEffect, useCallback } from 'react'
import { ShieldCheck, Lock } from 'lucide-react'

const ADMIN_PIN = '1234'

export default function AdminPinGate({ onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)]

  useEffect(() => {
    refs[0].current?.focus()
  }, [])

  const triggerShake = useCallback(() => {
    setShake(true)
    setError('รหัสไม่ถูกต้อง กรุณาลองใหม่')
    setTimeout(() => {
      setShake(false)
      setError('')
      setDigits(['', '', '', ''])
      refs[0].current?.focus()
    }, 600)
  }, [])

  const checkPin = useCallback((currentDigits) => {
    const pin = currentDigits.join('')
    if (pin === ADMIN_PIN) {
      setSuccess(true)
      setTimeout(() => onSuccess(), 300)
    } else {
      triggerShake()
    }
  }, [onSuccess, triggerShake])

  const handleChange = useCallback((idx, value) => {
    if (!/^\d?$/.test(value)) return

    const digit = value.slice(-1)
    const newDigits = [...digits]
    newDigits[idx] = digit
    setDigits(newDigits)

    if (digit && idx < 3) {
      refs[idx + 1].current?.focus()
    }

    if (digit && idx === 3) {
      const full = [...newDigits.slice(0, 3), digit]
      if (full.every(d => d !== '')) {
        checkPin(full)
      }
    }
  }, [digits, checkPin])

  const handleKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        const newDigits = [...digits]
        newDigits[idx - 1] = ''
        setDigits(newDigits)
        refs[idx - 1].current?.focus()
      } else {
        const newDigits = [...digits]
        newDigits[idx] = ''
        setDigits(newDigits)
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs[idx - 1].current?.focus()
    } else if (e.key === 'ArrowRight' && idx < 3) {
      refs[idx + 1].current?.focus()
    }
  }, [digits])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!pasted) return
    const newDigits = ['', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)
    const focusIdx = Math.min(pasted.length, 3)
    refs[focusIdx].current?.focus()
    if (pasted.length === 4) {
      checkPin(newDigits)
    }
  }, [checkPin])

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4"
    >
      <div
        className="card w-full max-w-sm p-8 flex flex-col items-center gap-6"
        style={{ animation: 'slideUp 0.3s ease' }}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: success
                ? 'color-mix(in srgb, var(--c-accent) 20%, transparent)'
                : 'color-mix(in srgb, var(--c-surface-alt) 80%, transparent)',
              border: '1px solid var(--c-border)',
              transition: 'background-color 0.3s ease',
            }}
          >
            {success
              ? <ShieldCheck size={32} style={{ color: 'var(--c-accent)' }} />
              : <Lock size={32} style={{ color: 'var(--c-text-2)' }} />
            }
          </div>
          <div className="text-center">
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--c-text-1)' }}
            >
              Admin Authentication
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--c-text-2)' }}>
              กรอกรหัส PIN 4 หลักเพื่อเข้าใช้งาน
            </p>
          </div>
        </div>

        {/* PIN Fields */}
        <div className={`flex gap-3 ${shake ? 'shake' : ''} ${success ? 'pin-success' : ''}`}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={refs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className="pin-input"
              style={{
                borderColor: success
                  ? 'var(--c-accent)'
                  : digit
                    ? 'color-mix(in srgb, var(--c-accent) 60%, var(--c-border))'
                    : 'var(--c-border)',
              }}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={success}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Error Message */}
        <div className="h-5 flex items-center justify-center">
          {error && (
            <p
              className="text-sm font-medium"
              style={{ color: '#ef4444', animation: 'fadeIn 0.2s ease' }}
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--c-accent)', animation: 'fadeIn 0.2s ease' }}
            >
              ✓ เข้าสู่ระบบสำเร็จ
            </p>
          )}
        </div>

        {/* Hint */}
        <p className="text-xs text-center" style={{ color: 'var(--c-text-2)', opacity: 0.5 }}>
          กรอกรหัส PIN อัตโนมัติเมื่อพิมพ์ครบ 4 หลัก
        </p>
      </div>
    </div>
  )
}
