'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Calendar from '@/components/Calendar'
import DateDetail from '@/components/DateDetail'
import Chatbot from '@/components/chatbot/Chatbot'
import { useUser } from '@/contexts/UserContext'
import { db } from '@/lib/supabaseClient'
import { type PowerPlant, type ConsumptionTool, type StorageUnit, type Schedule, type EnergyStatus } from '@/lib/supabaseClient'
import { calculateEnergyStatusRange } from '@/lib/energyCalculator'

export default function Dashboard() {
  const { user, login, loading } = useUser()
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([])
  const [consumptionTools, setConsumptionTools] = useState<ConsumptionTool[]>([])
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [energyStatuses, setEnergyStatuses] = useState<{ [date: string]: EnergyStatus }>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [showDateDetail, setShowDateDetail] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user, loading, login]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Auto-login demo user if not logged in
      if (!user && !loading) {
        await login()
        return
      }
      
      if (!user) {
        console.log('No user logged in')
        return
      }
      
      // Load all data for the user
      const [plants, tools, storage, userSchedules] = await Promise.all([
        db.getPowerPlants(user.id),
        db.getConsumptionTools(user.id),
        db.getStorageUnits(user.id),
        db.getSchedules(user.id)
      ])
      
      setPowerPlants(plants)
      setConsumptionTools(tools)
      setStorageUnits(storage)
      setSchedules(userSchedules)
      
      // Calculate energy statuses for the current month
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      const startDate = startOfMonth.toISOString().split('T')[0]
      const endDate = endOfMonth.toISOString().split('T')[0]
      
      const statusMap = calculateEnergyStatusRange(startDate, endDate, userSchedules, storage)
      setEnergyStatuses(statusMap)
      
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDateDetail(true)
  }

  const handleSaveSchedule = async (newSchedules: Schedule[]) => {
    if (!user) return

    try {
      console.log('Saving schedules:', newSchedules)
      
      // Delete existing schedules for this date
      const dateString = selectedDate?.toISOString().split('T')[0]
      console.log('Date string:', dateString)
      
      if (dateString) {
        console.log('Deleting existing schedules for date:', dateString)
        await db.deleteScheduleByDate(user.id, dateString)
      }

      // Create new schedules
      const schedulesWithUserId = newSchedules.map(schedule => ({
        ...schedule,
        user_id: user.id
      }))
      
      console.log('Schedules with user ID:', schedulesWithUserId)

      for (const schedule of schedulesWithUserId) {
        console.log('Creating schedule:', schedule)
        await db.createSchedule(schedule)
      }

      // Reload schedules and recalculate energy statuses
      const updatedSchedules = await db.getSchedules(user.id)
      setSchedules(updatedSchedules)

      // Recalculate energy statuses
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      const startDate = startOfMonth.toISOString().split('T')[0]
      const endDate = endOfMonth.toISOString().split('T')[0]
      
      const statusMap = calculateEnergyStatusRange(startDate, endDate, updatedSchedules, storageUnits)
      setEnergyStatuses(statusMap)

    } catch (error) {
      console.error('Error saving schedule:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      // Show user-friendly error message
      alert('Failed to save schedule. Please check the console for details.')
    }
  }

  const closeDateDetail = () => {
    setShowDateDetail(false)
    setSelectedDate(undefined)
  }

  // Calculate today's summary
  // const today = new Date()
  
  // Calculate total power generation capacity
  const totalPowerCapacity = powerPlants.reduce((sum, plant) => {
    return sum + (plant.kw_per_hour * plant.quantity)
  }, 0)
  
  // Calculate total consumption capacity
  const totalConsumptionCapacity = consumptionTools.reduce((sum, tool) => {
    return sum + tool.kw_per_hour
  }, 0)
  
  // Calculate storage metrics
  const totalStorageCapacity = storageUnits.reduce((sum, storage) => {
    return sum + storage.capacity_kwh
  }, 0)
  
  const totalCurrentStorage = storageUnits.reduce((sum, storage) => {
    return sum + storage.current_kwh
  }, 0)
  
  const storageUsage = totalStorageCapacity > 0 ? (totalCurrentStorage / totalStorageCapacity) * 100 : 0

  // Determine energy status
  let energyStatus: 'green' | 'yellow' | 'red' = 'green'
  let statusText = 'Balanced System'
  
  if (totalPowerCapacity >= totalConsumptionCapacity) {
    energyStatus = 'green'
    statusText = 'Sufficient Generation Capacity'
  } else if (totalPowerCapacity >= totalConsumptionCapacity * 0.8) {
    energyStatus = 'yellow'
    statusText = 'Borderline Generation'
  } else {
    energyStatus = 'red'
    statusText = 'Insufficient Generation'
  }

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
      case 'yellow':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'red':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-emerald-400 tracking-wide hover:text-emerald-300 transition-all duration-300">
                ACEP
              </Link>
              <span className="ml-4 text-gray-400">Energy Planning Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/consumption"
                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]"
              >
                Consumption Tools
              </Link>
              <Link
                href="/dashboard/powerplants"
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
              >
                Power Plants & Weather
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="text-2xl font-bold text-emerald-400">
                {totalPowerCapacity.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Total Generation Capacity (kW)</div>
            </div>
            <div className="text-center bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl font-bold text-blue-400">
                {storageUsage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Storage Usage</div>
            </div>
            <div className="text-center bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-purple-500/30 transition-all duration-300">
              <div className="text-2xl font-bold text-purple-400">
                {totalConsumptionCapacity.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Total Consumption Capacity (kW)</div>
            </div>
            <div className="text-center bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(energyStatus)}`}>
                {statusText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <Calendar
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                schedules={schedules}
                energyStatuses={energyStatuses}
              />
            </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-6 hover:border-emerald-500/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Link
                  href="/consumption"
                  className="flex items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:border-blue-500/30 border border-gray-700"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-white">Consumption Tools</h4>
                    <p className="text-sm text-gray-400">Manage power-consuming equipment</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/powerplants"
                  className="flex items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:border-emerald-500/30 border border-gray-700"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-white">Power Plants & Weather</h4>
                    <p className="text-sm text-gray-400">Configure energy generation with weather predictions</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-6 hover:border-emerald-500/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">Storage Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Capacity</span>
                  <span className="font-medium text-white">{totalStorageCapacity.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Level</span>
                  <span className="font-medium text-white">{totalCurrentStorage.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Usage</span>
                  <span className="font-medium text-white">{storageUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(storageUsage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Date Detail Modal */}
      {showDateDetail && selectedDate && (
        <DateDetail
          date={selectedDate}
          onClose={closeDateDetail}
          onSave={handleSaveSchedule}
          consumptionTools={consumptionTools}
          existingSchedules={schedules.filter(schedule => 
            schedule.date === selectedDate.toISOString().split('T')[0]
          )}
          energyStatus={energyStatuses[selectedDate.toISOString().split('T')[0]] || 'safe'}
        />
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}