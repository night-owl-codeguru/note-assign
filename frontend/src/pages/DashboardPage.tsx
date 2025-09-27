import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSwipeable } from 'react-swipeable'
import LoadingButton from '../components/LoadingButton'
import LoadingSpinner from '../components/LoadingSpinner'
import Layout from '../components/Layout'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import { useAuth } from '../hooks/useAuth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type Note = { _id: string; content: string }

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(true) // Require authentication
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [creatingNote, setCreatingNote] = useState(false)
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set())

  const load = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      if (!user.verified) {
        setError('You need to verify your account before accessing the dashboard.')
        return
      }
      const { data } = await axios.get(`${API}/notes`, { withCredentials: true })
      setNotes(data.notes)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    if (user && !authLoading) {
      load() 
    }
  }, [user, authLoading])

  const onCreate = async () => {
    if (!content.trim()) return
    setCreatingNote(true)
    try {
      const { data } = await axios.post(`${API}/notes`, { content }, { withCredentials: true })
      setNotes([data.note, ...notes])
      setContent('')
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create note')
    } finally {
      setCreatingNote(false)
    }
  }

  const onDelete = async (id: string) => {
    setDeletingNotes(prev => new Set(prev).add(id))
    try {
      await axios.delete(`${API}/notes/${id}`, { withCredentials: true })
      setNotes(notes.filter(n => n._id !== id))
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete note')
    } finally {
      setDeletingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <PageTransition>
          <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" color="primary" />
              <p className="text-gray-600">Loading your notes...</p>
            </div>
          </div>
        </PageTransition>
      </Layout>
    )
  }

  if (!user) {
    return null // Will be redirected by the auth hook
  }

  return (
    <Layout>
      <PageTransition>
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-primary to-blue-600 bg-clip-text text-transparent">
              Welcome{user ? `, ${user.name}` : ''}
            </h1>
            <p className="text-gray-500 text-base sm:text-lg">{user?.email}</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-6 rounded-2xl border border-red-200 bg-red-50/50">
              <div className="text-red-600">
                {error}
                {!user?.verified && (
                  <div className="mt-3 text-gray-700">
                    Please check your email for the OTP and complete verification on the Auth page.
                    <div className="mt-2">
                      <a href="/" className="text-primary font-medium hover:underline">Go to verification</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {user?.verified && (
          <>
            {/* Create Note Section */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Create a new note</h2>
              <div className="p-4 sm:p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea 
                    className="flex-1 min-h-[80px] sm:min-h-[60px] resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="What's on your mind?"
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && !creatingNote && onCreate()}
                  />
                  <div className="flex flex-row sm:flex-col gap-2 justify-between sm:justify-start">
                    <LoadingButton 
                      onClick={onCreate} 
                      loading={creatingNote} 
                      disabled={!content.trim()}
                      className="px-6 flex-1 sm:flex-initial"
                    >
                      Create
                    </LoadingButton>
                    <p className="text-xs text-gray-500 self-center sm:text-center hidden sm:block">Ctrl+Enter</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your notes</h2>
                <span className="text-sm text-gray-500">{notes.length} notes</span>
              </div>
              
              {notes.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No notes yet</h3>
                  <p className="text-sm sm:text-base text-gray-500">Create your first note to get started</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {notes.map(n => (
                    <SwipeToDelete key={n._id} onDelete={() => onDelete(n._id)}>
                      <div className="group relative p-4 sm:p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                        <div className="mb-3 sm:mb-4">
                          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base">
                            {n.content}
                          </div>
                        </div>
                        <div className="flex justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <LoadingButton 
                            onClick={() => onDelete(n._id)} 
                            loading={deletingNotes.has(n._id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </LoadingButton>
                        </div>
                      </div>
                    </SwipeToDelete>
                  ))}
                </div>
              )}
            </div>
          </>
          )}
        </div>
      </PageTransition>
    </Layout>
  )
}

function SwipeToDelete({ children, onDelete }: { children: any, onDelete: () => void }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => onDelete(),
    preventScrollOnSwipe: true,
    trackMouse: true
  })
  return <div {...handlers}>{children}</div>
}
