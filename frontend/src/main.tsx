import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'

const router = createBrowserRouter([
  { path: '/', element: <AuthPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
