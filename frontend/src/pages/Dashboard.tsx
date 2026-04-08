/**
 * Dashboard page — Progress overview with premium dark design
 */

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Plus, ArrowRight, GraduationCap, Clock, TrendingUp } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../lib/api'
import type { ProgressEntry } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const sessionId = useAppStore((s) => s.sessionId)
  const storeCurriculums = useAppStore((s) => s.curriculums)
  const setCurriculums = useAppStore((s) => s.setCurriculums)

  const [loading, setLoading] = useState(true)
  const [curriculums, setCurriculumsLocal] = useState<ProgressEntry[]>([])

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getProgress(sessionId)
        if (data.curriculums.length > 0) {
          setCurriculumsLocal(data.curriculums)
          setCurriculums(data.curriculums)
        } else {
          // Fall back to local store data
          setCurriculumsLocal(storeCurriculums)
        }
      } catch {
        // Fall back to store
        setCurriculumsLocal(storeCurriculums)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [sessionId])

  const totalCurricula = curriculums.length
  const avgCompletion = totalCurricula > 0
    ? Math.round(curriculums.reduce((a, c) => a + c.completion_pct, 0) / totalCurricula)
    : 0

  return (
    <div className="min-h-screen bg-aurora">
      {/* Header */}
      <header className="glass-strong border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">AdaptEd</span>
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity glow-sm"
          >
            <Plus className="w-4 h-4" />
            New Curriculum
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <StatCard icon={<GraduationCap className="w-5 h-5" />} label="Curricula" value={String(totalCurricula)} color="from-purple-500 to-violet-500" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />}  label="Avg Completion" value={`${avgCompletion}%`} color="from-violet-500 to-fuchsia-500" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Last Active" value={curriculums.length > 0 ? timeAgo(curriculums[0].last_accessed) : '—'} color="from-fuchsia-500 to-pink-500" />
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-6 animate-shimmer h-40" />
            ))}
          </div>
        ) : curriculums.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <GraduationCap className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No curricula yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Start your learning journey! Enter a topic you want to master and we'll create a personalized curriculum just for you.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity glow-sm"
            >
              Start Learning
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculums.map((c, idx) => (
              <motion.div
                key={c.lesson_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => navigate(`/curriculum/${c.lesson_id}`)}
                className="glass rounded-xl p-5 cursor-pointer hover:shadow-glow hover:border-primary/20 transition-all group"
              >
                <h3 className="font-semibold text-foreground text-sm mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {c.goal}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{Math.round(c.completion_pct)}% complete</span>
                  <span>{timeAgo(c.last_accessed)}</span>
                </div>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full progress-gradient rounded-full transition-all"
                    style={{ width: `${Math.max(c.completion_pct, 2)}%` }}
                  />
                </div>
                <div className="flex items-center justify-end mt-3">
                  <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  } catch {
    return '—'
  }
}
