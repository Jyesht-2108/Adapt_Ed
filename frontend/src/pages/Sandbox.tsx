/**
 * Sandbox page — Socratic practice environment with premium dark theme
 */

import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Code2, FileText, Lightbulb, Loader2, RotateCcw } from 'lucide-react'
import { apiClient } from '../lib/api'
import CodeEditor from '../components/CodeEditor'
import TextEditor from '../components/TextEditor'
import type { LessonResponse, Hint, SandboxMode, HintType } from '../types'

const HINT_TYPE_STYLES: Record<HintType, { label: string; cls: string; icon: string }> = {
  direction: { label: 'Direction', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '→' },
  question: { label: 'Question', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: '?' },
  observation: { label: 'Observation', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '👁' },
}

export default function Sandbox() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const editorContentRef = useRef('')
  const [hints, setHints] = useState<Hint[]>([])
  const [isGettingHint, setIsGettingHint] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  const hintsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lessonId) { navigate('/'); return }
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getCurriculum(lessonId)
        setLesson(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [lessonId, navigate])

  // Scroll to latest hint
  useEffect(() => {
    hintsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [hints])

  const handleGetHint = async () => {
    if (!lessonId || isGettingHint) return
    setIsGettingHint(true)
    try {
      const hint = await apiClient.getSandboxHint({
        lesson_id: lessonId,
        module_index: 0,
        lesson_index: 0,
        user_content: editorContentRef.current,
        mode: mode,
        language: language,
        attempt_count: attemptCount,
      })
      setHints((p) => [...p, hint])
      setAttemptCount(hint.attempt_count)
    } catch {
      setHints((p) => [...p, { hint: 'Failed to get hint. Please try again.', hint_type: 'direction', attempt_count: attemptCount, reflect: false }])
    } finally {
      setIsGettingHint(false)
    }
  }

  const handleEditorChange = (value: string) => { editorContentRef.current = value }

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-aurora flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load</h2>
          <p className="text-sm text-destructive mb-6">{error || 'Lesson not found'}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm">Go Home</button>
        </div>
      </div>
    )
  }

  const mode: SandboxMode = lesson.sandbox_mode || 'code'
  const language = lesson.sandbox_language || 'python'
  const latestHint = hints[hints.length - 1]

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 glass-strong border-b border-border/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-4 h-4" />
            <span className="font-semibold text-sm">AdaptEd</span>
          </Link>
          <span className="text-border">|</span>
          <button onClick={() => navigate(`/curriculum/${lessonId}`)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Curriculum
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/30">
            {mode === 'code' ? <Code2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {mode === 'code' ? language : 'Text'}
          </span>
        </div>
      </header>

      {/* Main two-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — Editor */}
        <div className="flex-1 flex flex-col border-r border-border/30">
          <div className="px-4 py-2.5 border-b border-border/30 bg-card/30">
            <h2 className="text-sm font-semibold text-foreground">Practice Area</h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.goal_raw}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            {mode === 'code' ? (
              <CodeEditor language={language} onChange={handleEditorChange} />
            ) : (
              <TextEditor onChange={handleEditorChange} />
            )}
          </div>
        </div>

        {/* Right panel — Hints */}
        <div className="w-[380px] flex flex-col bg-card/40">
          <div className="px-4 py-2.5 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Socratic Hints
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Guided thinking, not answers</p>
          </div>

          {/* Hints scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {hints.length === 0 && (
              <div className="text-center py-16">
                <Lightbulb className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/60">No hints yet</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Click "Get a Hint" to start</p>
              </div>
            )}
            {hints.map((hint, i) => {
              const cfg = HINT_TYPE_STYLES[hint.hint_type]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-secondary/30 border border-border/30 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.cls}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">#{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{hint.hint}</p>
                </motion.div>
              )
            })}

            {/* Reflect prompt */}
            {latestHint?.reflect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4"
              >
                <h4 className="text-sm font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  Time to Reflect
                </h4>
                <p className="text-xs text-amber-300/80 mb-3">
                  You've been working on this for a while. Would you like to revisit the lesson?
                </p>
                <button
                  onClick={() => navigate(`/curriculum/${lessonId}`)}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  Revisit Lesson
                </button>
              </motion.div>
            )}

            <div ref={hintsEndRef} />
          </div>

          {/* Get hint button */}
          <div className="p-4 border-t border-border/30">
            <button
              onClick={handleGetHint}
              disabled={isGettingHint}
              className="w-full h-11 rounded-xl gradient-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isGettingHint ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Getting hint…</>
              ) : (
                <><Lightbulb className="w-4 h-4" /> Get a Hint</>
              )}
            </button>
            {hints.length > 0 && (
              <p className="text-[11px] text-muted-foreground/60 text-center mt-2 tabular-nums">
                {hints.length} hint{hints.length !== 1 ? 's' : ''} used
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
