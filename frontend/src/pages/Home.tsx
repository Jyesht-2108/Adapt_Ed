import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/api'
import { useAppStore } from '../store/useAppStore'

export default function Home() {
  const [goal, setGoal] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const sessionId = useAppStore((state) => state.sessionId)

  const exampleGoals = [
    'Build a REST API with FastAPI',
    'Understand the DSM-5 criteria for ADHD',
    'Learn how transformers work from scratch',
    'Master SQL joins and subqueries',
    'Understand React hooks in depth',
  ]

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
      const response = await apiClient.generateCurriculum({
        goal: goal.trim(),
        session_id: sessionId,
      })

      // Navigate to generating page with context
      navigate(`/generating/${response.generation_id}`, {
        state: { cached: response.cached, goal: goal.trim() },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              AdaptEd
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master any subject, at your own pace, in a format that works for your brain
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="goal" className="block text-lg font-semibold text-foreground mb-3">
                      What do you want to learn today?
                    </label>
                    <div className="relative">
                      <textarea
                        id="goal"
                        value={goal}
                        onChange={(e) => {
                          setGoal(e.target.value)
                          if (error) setError('')
                        }}
                        placeholder="e.g., Learn machine learning fundamentals, Master React hooks, Understand quantum computing..."
                        className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none resize-none transition-all text-foreground placeholder:text-muted-foreground bg-background"
                        rows={4}
                        disabled={isLoading}
                      />
                      <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
                        {goal.length}/300
                      </div>
                    </div>
                    {error && (
                      <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={goal.trim().length < 10 || isLoading}
                    size="lg"
                    className="w-full text-base"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate My Curriculum
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Examples Section */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-4">Popular learning goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleGoals.map((example, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        onClick={() => setGoal(example)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors border border-border disabled:opacity-50"
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="AI-Powered"
              description="Personalized curriculum generated by advanced AI"
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Adaptive Learning"
              description="Content that adapts to your learning style"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Interactive"
              description="Practice with code sandbox and viva exams"
            />
          </motion.div>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              View my progress
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
