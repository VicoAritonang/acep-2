'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    <nav className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-emerald-400 tracking-wide hover:text-emerald-300 transition-all duration-300 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              ACEP
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={handleDemoLogin}
                disabled={isLoggingIn}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-xl text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] hover:scale-105"
              >
                {isLoggingIn ? 'Logging in...' : 'Masuk Demo'}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-emerald-400 focus:outline-none focus:text-emerald-400 transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl mt-2">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  handleDemoLogin()
                }}
                disabled={isLoggingIn}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold block w-full text-left px-4 py-3 rounded-xl text-base transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
              >
                {isLoggingIn ? 'Logging in...' : 'Masuk Demo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
