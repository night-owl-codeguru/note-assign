import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type User = { name: string; email: string; verified?: boolean }

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const checkAuth = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true })
      setUser(response.data.user)
      
      // If user is authenticated but on auth page, redirect to dashboard
      if (response.data.user && location.pathname === '/') {
        navigate('/dashboard')
      }
    } catch (e: any) {
      setUser(null)
      
      // If auth is required but user is not authenticated, redirect to auth page
      if (requireAuth && location.pathname !== '/') {
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoggingOut(true)
    setError('')
    try {
      // Call the logout endpoint to properly clear the cookie
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true })
      setUser(null)
      navigate('/')
    } catch (e: any) {
      // Even if the API call fails, clear local state and redirect
      console.error('Logout API failed:', e)
      setError('Logout failed, but redirecting anyway')
      setUser(null)
      navigate('/')
    } finally {
      setLoggingOut(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [location.pathname])

  return { user, loading, error, logout, checkAuth, loggingOut }
}