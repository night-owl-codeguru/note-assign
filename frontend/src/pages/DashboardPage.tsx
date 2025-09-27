import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSwipeable } from 'react-swipeable'
import LoadingButton from '../components/LoadingButton'
import LoadingSpinner from '../components/LoadingSpinner'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type Note = { _id: string; content: string }
type User = { name: string; email: string }

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingNote, setCreatingNote] = useState(false)
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set())

  const load = async () => {
    setLoading(true)
    try {
      const u = await axios.get(`${API}/auth/me`, { withCredentials: true })
      setUser(u.data.user)
      const { data } = await axios.get(`${API}/notes`, { withCredentials: true })
      setNotes(data.notes)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" color="primary" />
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2" style={{ color: '#367AFF' }}>Welcome{user ? `, ${user.name}` : ''}</h1>
      <p className="text-gray-600 mb-4">{user?.email}</p>

      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

      <div className="flex gap-2 mb-4">
        <input 
          className="input" 
          placeholder="Write a note..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !creatingNote && onCreate()}
        />
        <LoadingButton onClick={onCreate} loading={creatingNote} disabled={!content.trim()}>
          Create
        </LoadingButton>
      </div>

      <div className="grid gap-2">
        {notes.map(n => (
          <SwipeToDelete key={n._id} onDelete={() => onDelete(n._id)}>
            <div className="rounded-md border p-3 bg-white flex items-start justify-between">
              <div className="whitespace-pre-wrap">{n.content}</div>
              <LoadingButton 
                onClick={() => onDelete(n._id)} 
                loading={deletingNotes.has(n._id)}
                variant="danger"
                size="sm"
              >
                Delete
              </LoadingButton>
            </div>
          </SwipeToDelete>
        ))}
      </div>
    </div>
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
