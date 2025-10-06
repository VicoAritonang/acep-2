'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Benefits() {
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

  const benefits = [
    {
      title: "Reduce operational costs by up to 60%",
      description: "Switch from expensive fuel generators to cost-effective solar and storage solutions.",
      icon: "💰",
    },
    {
      title: "Cut carbon emissions by up to 75%",
      description: "Significantly reduce your environmental footprint with clean energy alternatives.",
      icon: "🌱",
    },
    {
      title: "Plan optimal solar + storage capacity",
      description: "Get precise recommendations for your specific energy needs and location.",
      icon: "⚡",
    },
  ]

  return (
    <section className="py-20 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
            Why Choose ACEP?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform your remote operations with intelligent energy planning
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-8 hover:scale-[1.02] hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-500/30"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Energy Strategy?
            </h3>
            <p className="text-gray-400 mb-6">
              Experience the power of intelligent energy planning with our demo dashboard
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            >
              {isLoggingIn ? 'Loading Demo...' : 'Start Demo Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
