/**
 * Home page — Goal intake with premium dark design
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, Sparkles, ArrowRight, Zap, Brain, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../lib/api'

const EXAMPLE_GOALS = [
  'Build a REST API with FastAPI',
  'Understand the DSM-5 criteria for ADHD',
  'Learn how transformers work from scratch',
  'Master SQL joins and subqueries',
  'Understand React hooks in depth',
]

export default function Home() {
  const [goal, setGoal] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const sessionId = useAppStore((s) => s.sessionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (goal.trim().length < 10) {
      setError('Please enter at least 10 characters')
      return
    }
    if (goal.length > 300) {
      setError('Please keep your goal under 300 characters')
      return
    }

    setIsLoading(true)
    try {
      const res = await apiClient.generateCurriculum({
        goal: goal.trim(),
        session_id: sessionId,
      })

      if (res.cached) {
        // Go straight to curriculum view
        navigate(`/curriculum/${res.generation_id}`)
      } else {
        navigate(`/generating/${res.generation_id}`, {
          state: { cached: false, goal: goal.trim() },
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-aurora relative overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-blob" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-fuchsia-600/8 blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Header nav */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">AdaptEd</span>
          </div>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            My Progress
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-16">
        <div className="max-w-3xl w-full">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI-Powered Personalized Learning
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]">
              <span className="text-foreground">Learn anything,</span>
              <br />
              <span className="gradient-text">your way.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Tell us what you want to master. We'll build a personalized curriculum from real-time web sources, with a Socratic tutor that guides — never spoils.
            </p>
          </motion.div>

          {/* Goal Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="glass-strong rounded-2xl p-1">
              <div className="rounded-[14px] bg-card/80 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="goal-input" className="block text-sm font-semibold text-foreground mb-2.5">
                      What do you want to learn?
                    </label>
                    <div className="relative">
                      <textarea
                        id="goal-input"
                        value={goal}
                        onChange={(e) => { setGoal(e.target.value); error && setError('') }}
                        placeholder="e.g., Learn machine learning fundamentals, Master React hooks, Understand quantum computing..."
                        className="w-full px-4 py-3.5 bg-secondary/50 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all text-foreground placeholder:text-muted-foreground/60 text-[15px] leading-relaxed"
                        rows={3}
                        disabled={isLoading}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60 tabular-nums">
                        {goal.length}/300
                      </div>
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-1.5 text-destructive text-sm"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={goal.trim().length < 10 || isLoading}
                    className="w-full h-12 rounded-xl gradient-primary text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-sm hover:shadow-glow active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate My Curriculum
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Example chips */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Try one of these:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_GOALS.map((example, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + idx * 0.06 }}
                        onClick={() => setGoal(example)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary/70 text-secondary-foreground border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all disabled:opacity-40"
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="AI-Powered"
              description="Personalized curriculum from real-time web sources using advanced AI"
              gradient="from-purple-500 to-violet-500"
            />
            <FeatureCard
              icon={<Brain className="w-5 h-5" />}
              title="Socratic Sandbox"
              description="Practice with a tutor that guides your thinking — never gives direct answers"
              gradient="from-violet-500 to-fuchsia-500"
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="Dyslexia Friendly"
              description="OpenDyslexic font applied globally via Chrome extension on source sites"
              gradient="from-fuchsia-500 to-pink-500"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="glass rounded-xl p-5 hover:shadow-glow transition-all group cursor-default">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3.5 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1.5 text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
