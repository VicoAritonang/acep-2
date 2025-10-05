'use client'

import { useState } from 'react'
import { type Schedule, type EnergyStatus } from '@/lib/supabaseClient'

interface CalendarProps {
  onDateClick: (date: Date) => void
  selectedDate?: Date
  schedules: Schedule[]
  energyStatuses: { [date: string]: EnergyStatus }
}

export default function Calendar({ onDateClick, selectedDate, schedules, energyStatuses }: CalendarProps) {
  // const [currentDate, setCurrentDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const today = new Date()

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getEnergyStatusColor = (status: EnergyStatus) => {
    switch (status) {
      case 'safe':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'insufficient':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getEnergyStatusIcon = (status: EnergyStatus) => {
    switch (status) {
      case 'safe':
        return '✓'
      case 'warning':
        return '⚠'
      case 'insufficient':
        return '✗'
      default:
        return '?'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-700"></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateString = getDateString(date)
      const isToday = dateString === getDateString(today)
      const isSelected = selectedDate && getDateString(selectedDate) === dateString
      const energyStatus = energyStatuses[dateString]
      const daySchedules = schedules.filter(schedule => 
        getDateString(new Date(schedule.date)) === dateString
      )

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(date)}
          className={`h-24 border border-gray-700 p-2 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
            isSelected ? 'bg-emerald-500/20 border-emerald-500/50' : ''
          } ${isToday ? 'bg-emerald-500/10' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-emerald-400' : 'text-white'}`}>
              {day}
            </span>
            {energyStatus && (
              <span className={`text-xs px-2 py-1 rounded-full ${getEnergyStatusColor(energyStatus)}`}>
                {getEnergyStatusIcon(energyStatus)}
              </span>
            )}
          </div>
          
          {daySchedules.length > 0 && (
            <div className="mt-1">
              <div className="text-xs text-gray-400">
                {daySchedules.length} device{daySchedules.length > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-800/50 rounded-xl transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-white">
            {months[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-800/50 rounded-xl transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
        >
          Today
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full"></div>
          <span className="text-gray-400">Safe</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/50 rounded-full"></div>
          <span className="text-gray-400">Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded-full"></div>
          <span className="text-gray-400">Insufficient</span>
        </div>
      </div>
    </div>
  )
}