'use client'

import { useState } from 'react'
interface DateScrollProps {
  forecasts: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  onDateClick: (forecast: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  selectedDate?: string
}

export default function DateScroll({ forecasts, onDateClick, selectedDate }: DateScrollProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const getGenerationColor = (forecast: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const kwh = forecast.predicted_kwh || 0
    if (kwh >= 50) return 'from-green-400 to-green-600'
    if (kwh >= 30) return 'from-yellow-400 to-yellow-600'
    if (kwh >= 15) return 'from-orange-400 to-orange-600'
    return 'from-red-400 to-red-600'
  }

  const getGenerationStatus = (forecast: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return forecast.weather_condition || 'Unknown'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    }
  }

  const scrollLeft = () => {
    setScrollPosition(prev => Math.max(0, prev - 200))
  }

  const scrollRight = () => {
    setScrollPosition(prev => prev + 200)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">14-Day Weather Forecast</h3>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex space-x-4 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {forecasts.map((forecast) => {
            const dateInfo = formatDate(forecast.date)
            const isSelected = selectedDate === forecast.date
            const generationColor = getGenerationColor(forecast)
            const status = getGenerationStatus(forecast)

            return (
              <button
                key={forecast.date}
                onClick={() => onDateClick(forecast)}
                className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  isSelected 
                    ? 'border-green-500 bg-green-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">{dateInfo.weekday}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{dateInfo.day}</div>
                  <div className="text-xs text-gray-500 mb-3">{dateInfo.month}</div>
                  
                  <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${generationColor} flex items-center justify-center mb-2`}>
                    <div className="text-white text-center">
                      <div className="text-lg font-bold">{(forecast.predicted_kwh || 0).toFixed(1)}</div>
                      <div className="text-xs">kWh</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-1">{status}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-center mt-4 space-x-1">
        {Array.from({ length: Math.ceil(forecasts.length / 4) }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              Math.floor(scrollPosition / 200) === index ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
