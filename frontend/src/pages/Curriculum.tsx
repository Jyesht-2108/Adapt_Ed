/**
 * Curriculum page — Fetches & renders real curriculum data
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Play, Download, ChevronDown, ExternalLink, Eye } from 'lucide-react'
import { apiClient } from '../lib/api'
import { useAppStore } from '../store/useAppStore'
import { openWithDyslexicMode } from '../lib/extensionBridge'
import type { LessonResponse, CurriculumContent } from '../types'

export default function Curriculum() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const sessionId = useAppStore((s) => s.sessionId)
  const addCurriculum = useAppStore((s) => s.addCurriculum)

  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  const [notesOpen, setNotesOpen] = useState(false)

  useEffect(() => {
    if (!lessonId) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getCurriculum(lessonId)
        setLesson(data)

        // Add to store for dashboard
        addCurriculum({
          lesson_id: lessonId,
          goal: data.goal_raw,
          completion_pct: 0,
          last_accessed: new Date().toISOString(),
        })

        // Fetch notes
        try {
          const n = await apiClient.getNotes(lessonId)
          setNotes(n.markdown)
        } catch { /* notes not critical */ }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load curriculum')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessonId])

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleLessonView = (mi: number, li: number) => {
    if (!lessonId) return
    apiClient.updateProgress(sessionId, {
      lesson_id: lessonId,
      module_index: mi,
      lesson_index: li,
      viewed: true,
    }).catch(() => {})
  }

  const downloadNotes = () => {
    if (!notes || !lesson) return
    const blob = new Blob([notes], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lesson.goal_raw.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading curriculum…</p>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load</h2>
          <p className="text-sm text-destructive mb-6">{error || 'Lesson not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const content: CurriculumContent = lesson.content
  const totalLessons = content.modules.reduce((a, m) => a + m.lessons.length, 0)

  return (
    <div className="min-h-screen bg-aurora">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold text-sm">AdaptEd</span>
            </Link>
            <span className="text-border">|</span>
            <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
          <button
            onClick={() => navigate(`/sandbox/${lessonId}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity glow-sm"
          >
            <Play className="w-4 h-4" />
            Open Sandbox
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Goal banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl gradient-primary p-6 sm:p-8 mb-8 shadow-glow-lg"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{content.goal}</h1>
          <p className="text-white/70 text-sm">
            {content.modules.length} module{content.modules.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Modules */}
        <div className="space-y-4">
          {content.modules.map((mod, mi) => (
            <motion.div
              key={mi}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.08 }}
              className="glass-strong rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleModule(mi)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-glow">
                    {mi + 1}
                  </span>
                  <h2 className="text-lg font-semibold text-foreground text-left">{mod.title}</h2>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedModules.has(mi) ? 'rotate-180' : ''}`} />
              </button>

              {expandedModules.has(mi) && (
                <div className="px-6 pb-5 space-y-3">
                  {mod.lessons.map((les, li) => (
                    <div
                      key={li}
                      className="rounded-xl bg-secondary/30 border border-border/30 p-5 hover:border-primary/20 transition-colors"
                    >
                      <h3 className="font-semibold text-foreground mb-3 text-[15px]">{les.title}</h3>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
                        {les.content}
                      </div>

                      {/* Sources */}
                      {les.sources && les.sources.length > 0 && (
                        <div className="pt-3 border-t border-border/30">
                          <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-2">Sources</p>
                          <div className="space-y-1">
                            {les.sources.map((src, si) => (
                              <a
                                key={si}
                                href={src.url}
                                onClick={(e) => { e.preventDefault(); openWithDyslexicMode(src.url) }}
                                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors group"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="group-hover:underline truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleLessonView(mi, li)}
                        className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Mark as viewed
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Key takeaways */}
        {content.key_takeaways && content.key_takeaways.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 glass-strong rounded-xl p-6 border-l-4 border-primary"
          >
            <h3 className="font-semibold text-foreground mb-3">Key Takeaways</h3>
            <ul className="space-y-2">
              {content.key_takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">✦</span>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Notes panel */}
        {notes && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 glass-strong rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground text-sm">Study Notes</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadNotes() }}
                  className="px-3 py-1 text-xs font-medium rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                >
                  Download .md
                </button>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${notesOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {notesOpen && (
              <div className="px-6 pb-6">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-secondary/30 p-4 rounded-lg leading-relaxed">
                  {notes}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
