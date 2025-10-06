'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()

  const handleDemoLogin = async () => {
    setIsLoggingIn(true)
    try {
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Save user info to localStorage
        localStorage.setItem('acep-user', JSON.stringify(data.user))
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        alert('Failed to login. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to login. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="gradient-futuristic min-h-screen flex items-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-wide">
            Smarter Electricity Planning for{' '}
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Remote Industries
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Optimize your power strategy, reduce fuel costs, and cut emissions with 
            advanced clean energy planning solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            >
              {isLoggingIn ? 'Loading Demo...' : 'Try Demo Dashboard'}
            </button>
            <button
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
              className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              {isLoggingIn ? 'Loading...' : 'Explore Features'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
