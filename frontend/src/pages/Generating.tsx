/**
 * Generating page — real SSE stream with animated progress UI
 */

import { useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'
import { useSSEStream } from '../hooks/useSSEStream'
import { useAppStore } from '../store/useAppStore'

const STEP_LABELS = [
  'Planning your learning path',
  'Searching for resources',
  'Synthesizing curriculum',
  'Formatting & extracting notes',
]

export default function Generating() {
  const { generationId } = useParams<{ generationId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const sessionId = useAppStore((s) => s.sessionId)

  const { goal = '', cached = false } = (location.state as { goal?: string; cached?: boolean }) || {}

  const { status, step, totalSteps, chunks, lessonId, isComplete, error, isConnected } =
    useSSEStream(generationId ?? null, goal, sessionId)

  // Redirect on completion
  useEffect(() => {
    if (isComplete && lessonId) {
      const timer = setTimeout(() => navigate(`/curriculum/${lessonId}`), 1200)
      return () => clearTimeout(timer)
    }
  }, [isComplete, lessonId, navigate])

  // Handle cached — redirect immediately
  useEffect(() => {
    if (cached && generationId) {
      navigate(`/curriculum/${generationId}`, { replace: true })
    }
  }, [cached, generationId, navigate])

  const progressPct = totalSteps > 0 ? (step / totalSteps) * 100 : 0

  return (
    <div className="min-h-screen bg-aurora flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-violet-500/6 blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">AdaptEd</span>
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Generation Failed</h2>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Progress state */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-8"
          >
            {/* Spinning loader */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-border" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
                  style={{ animationDuration: '1.5s' }}
                />
                <span className="text-lg font-bold text-primary tabular-nums">
                  {step}/{totalSteps || 4}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Creating Your Curriculum</h2>
              {goal && (
                <p className="text-sm text-muted-foreground truncate max-w-sm mx-auto">{goal}</p>
              )}
            </div>

            {/* Step list */}
            <div className="space-y-3 mb-6">
              {STEP_LABELS.map((label, idx) => {
                const stepNum = idx + 1
                const isDone = step > stepNum
                const isCurrent = step === stepNum
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isDone
                        ? 'bg-success/10'
                        : isCurrent
                        ? 'bg-primary/10'
                        : 'bg-secondary/30'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-primary flex-shrink-0 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isDone
                          ? 'text-success'
                          : isCurrent
                          ? 'text-primary'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {label}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full progress-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Status text */}
            {status && (
              <p className="text-xs text-muted-foreground text-center mt-3">{status}</p>
            )}

            {/* Completion */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 text-center"
              >
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-success font-medium text-sm">Curriculum ready! Redirecting…</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
