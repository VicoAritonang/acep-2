'use client'

import { useState } from 'react'
interface WeatherDetailModalProps {
  forecast: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isOpen: boolean
  onClose: () => void
  onSavePrediction: (forecast: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function WeatherDetailModal({ 
  forecast, 
  isOpen, 
  onClose, 
  onSavePrediction 
}: WeatherDetailModalProps) {
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getHourlyData = () => {
    const hours = []
    const solarData = forecast.solar_radiation
    const cloudData = forecast.cloud_cover

    for (let i = 0; i < 24; i++) {
      const hour = i
      const solar = solarData[i] || 0
      const cloud = cloudData[i] || 0
      const time = `${hour.toString().padStart(2, '0')}:00`
      
      hours.push({
        hour,
        time,
        solar,
        cloud,
        production: (solar / 1000) * 0.2 * 10 // Simplified calculation for visualization
      })
    }
    return hours
  }

  const hourlyData = getHourlyData()
  const maxSolar = Math.max(...hourlyData.map(h => h.solar))
  const maxProduction = Math.max(...hourlyData.map(h => h.production))

  const handleSavePrediction = async () => {
    setIsSaving(true)
    try {
      await onSavePrediction(forecast)
      onClose()
    } catch (error) {
      console.error('Error saving prediction:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatDate(forecast.date)}
              </h3>
              <p className="text-gray-600">{forecast.location}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-800">
                    {forecast.predicted_kwh.toFixed(1)} kWh
                  </div>
                  <div className="text-sm text-green-600">Predicted Generation</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-800">
                    {forecast.effective_hours}h
                  </div>
                  <div className="text-sm text-blue-600">Effective Hours</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-800">
                    {Math.round(forecast.cloud_cover.reduce((a: number, b: number) => a + b, 0) / forecast.cloud_cover.length)}%
                  </div>
                  <div className="text-sm text-purple-600">Avg Cloud Cover</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Charts */}
          <div className="space-y-8">
            {/* Solar Radiation Chart */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Solar Radiation (W/m²)</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end space-x-1 h-32">
                  {hourlyData.map((hour, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-t"
                        style={{ 
                          height: `${(hour.solar / maxSolar) * 100}%`,
                          minHeight: hour.solar > 0 ? '4px' : '0px'
                        }}
                        title={`${hour.time}: ${hour.solar.toFixed(1)} W/m²`}
                      />
                      <div className="text-xs text-gray-500 mt-1">{hour.hour}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cloud Cover Chart */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Cloud Cover (%)</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end space-x-1 h-32">
                  {hourlyData.map((hour, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-gray-400 to-gray-600 rounded-t"
                        style={{ 
                          height: `${(hour.cloud / 100) * 100}%`,
                          minHeight: hour.cloud > 0 ? '4px' : '0px'
                        }}
                        title={`${hour.time}: ${hour.cloud.toFixed(1)}%`}
                      />
                      <div className="text-xs text-gray-500 mt-1">{hour.hour}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Energy Production Chart */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Predicted Energy Production (kWh)</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end space-x-1 h-32">
                  {hourlyData.map((hour, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t"
                        style={{ 
                          height: `${(hour.production / maxProduction) * 100}%`,
                          minHeight: hour.production > 0 ? '4px' : '0px'
                        }}
                        title={`${hour.time}: ${hour.production.toFixed(2)} kWh`}
                      />
                      <div className="text-xs text-gray-500 mt-1">{hour.hour}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSavePrediction}
              disabled={isSaving}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Save Prediction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
