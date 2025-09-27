import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import side from '../../assets/side.png'
import logo from '../../assets/logo.png'
import LoadingButton from '../components/LoadingButton'
import LoadingSpinner from '../components/LoadingSpinner'
import PageTransition from '../components/PageTransition'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [otp, setOtp] = useState('')
  const [keep, setKeep] = useState(true)
  const [error, setError] = useState('')
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const googleDivRef = useRef<HTMLDivElement | null>(null)

  const onRequestOtp = async () => {
    setError('')
    setLoadingOtp(true)
    try {
      if (!isLogin && (!name || !dob)) {
        setError('Please enter name and date of birth')
        return
      }
      const payload = isLogin ? { email, name: 'User', dob: 'N/A' } : { email, name, dob }
      await axios.post(`${API}/auth/request-otp`, payload, { withCredentials: true })
      setOtpRequested(true)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to request OTP')
    } finally {
      setLoadingOtp(false)
    }
  }

  const onVerifyOtp = async () => {
    setError('')
    setLoadingVerify(true)
    try {
      await axios.post(`${API}/auth/verify-otp`, { email, otp, keepSignedIn: keep }, { withCredentials: true })
      window.location.href = '/dashboard'
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to verify OTP')
    } finally {
      setLoadingVerify(false)
    }
  }

  // Google sign-in
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !googleDivRef.current) return
    // Load script if not present
    const existing = document.getElementById('google-identity') as HTMLScriptElement | null
    const init = () => {
      // @ts-ignore
      if (!window.google || !window.google.accounts?.id) return
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (res: any) => {
          setLoadingGoogle(true)
          try {
            await axios.post(`${API}/auth/google`, { idToken: res.credential, keepSignedIn: keep }, { withCredentials: true })
            window.location.href = '/dashboard'
          } catch (e: any) {
            setError(e?.response?.data?.error || 'Google sign-in failed')
          } finally {
            setLoadingGoogle(false)
          }
        },
        ux_mode: 'popup'
      })
      // @ts-ignore
      window.google.accounts.id.renderButton(googleDivRef.current, { theme: 'outline', size: 'large', shape: 'pill' })
    }
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.defer = true
      s.id = 'google-identity'
      s.onload = init
      document.body.appendChild(s)
    } else if ((window as any).google) {
      init()
    } else {
      existing.addEventListener('load', init)
    }
  }, [keep])

  return (
    <PageTransition>
      <div className="relative min-h-screen w-screen">
        {/* Decorative side visual on large screens (no header on this page) */}
        <div className="hidden lg:block fixed top-0 left-0 h-screen w-[42vw] bg-primary/5 overflow-hidden">
          <img
            src={side}
            alt="side"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'left bottom' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/60" />
        </div>

        {/* Content */}
        <div className="relative flex min-h-screen items-center justify-center lg:ml-[42vw]">
          <div className="w-full max-w-md px-6 sm:px-8 py-8">
            <div className="flex items-center mb-3">
              <img src={logo} alt="Logo" className="h-8 sm:h-10" />
              <span className="text-2xl sm:text-3xl font-bold ml-2" style={{ color: '#367AFF' }}>HD</span>
            </div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{isLogin ? 'Login' : 'Create your account'}</p>

            {!isLogin && (
              <div className="grid gap-3 sm:gap-4 mb-4">
                <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="input" type="date" placeholder="Date of birth" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            )}

            <div className="grid gap-3 sm:gap-4">
              <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <LoadingButton onClick={onRequestOtp} loading={loadingOtp}>
                  Get OTP
                </LoadingButton>
                <div className="relative">
                  <div ref={googleDivRef} className={loadingGoogle ? 'opacity-50 pointer-events-none' : ''}></div>
                  {loadingGoogle && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner size="sm" color="primary" />
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {otpRequested && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="mt-2 grid gap-2">
                      <input className="input" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                      <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Keep me signed in
                      </label>
                      <LoadingButton onClick={onVerifyOtp} loading={loadingVerify}>
                        {isLogin ? 'Login' : 'Sign up'}
                      </LoadingButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="text-sm text-gray-600">
                {isLogin ? (
                  <>New here? <button className="text-primary" onClick={() => { setIsLogin(false); setOtp(''); setOtpRequested(false); }}>Create an account</button></>
                ) : (
                  <>Already have an account? <button className="text-primary" onClick={() => { setIsLogin(true); setOtp(''); setOtpRequested(false); }}>Login</button></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
