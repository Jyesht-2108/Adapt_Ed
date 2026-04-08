/**
 * Home page - Goal intake
 */

import { Link } from 'react-router-dom';
import GoalInput from '../components/GoalInput';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">AdaptEd</h1>
          <Link
            to="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Learn Anything, Your Way
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered personalized learning paths tailored to your goals.
              Start with what you want to learn, and we'll build the curriculum for you.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <GoalInput />
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1">Goal-Anchored</h3>
              <p className="text-sm text-gray-600">
                Every curriculum is built around your specific learning objective
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-semibold text-gray-900 mb-1">Socratic Practice</h3>
              <p className="text-sm text-gray-600">
                Learn by doing with hints that guide, never spoonfeed
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <div className="text-3xl mb-2">♿</div>
              <h3 className="font-semibold text-gray-900 mb-1">Accessible</h3>
              <p className="text-sm text-gray-600">
                Dyslexia-friendly typography follows you across the web
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
