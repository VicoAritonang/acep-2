'use client'

import { useState, useEffect } from 'react'
import { type Schedule, type ConsumptionTool, type EnergyStatus } from '@/lib/supabaseClient'

interface DateDetailProps {
  date: Date
  onClose: () => void
  onSave: (schedules: Schedule[]) => void
  consumptionTools: ConsumptionTool[]
  existingSchedules: Schedule[]
  energyStatus: EnergyStatus
}

interface DeviceAssignment {
  deviceId: string
  deviceName: string
  deviceType: 'consumption_tool'
  hoursUsed: number
  isRecurring: boolean
}

export default function DateDetail({ 
  date, 
  onClose, 
  onSave, 
  consumptionTools, 
  existingSchedules,
  energyStatus 
}: DateDetailProps) {
  const [assignments, setAssignments] = useState<DeviceAssignment[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize assignments from existing schedules
    const initialAssignments: DeviceAssignment[] = existingSchedules
      .filter(schedule => schedule.device_type === 'consumption_tool')
      .map(schedule => ({
        deviceId: schedule.device_id,
        deviceName: schedule.device_name,
        deviceType: 'consumption_tool' as const,
        hoursUsed: schedule.hours_used,
        isRecurring: schedule.is_recurring
      }))
    setAssignments(initialAssignments)
  }, [existingSchedules])

  const addAssignment = () => {
    setAssignments(prev => [...prev, {
      deviceId: '',
      deviceName: '',
      deviceType: 'consumption_tool' as const,
      hoursUsed: 0,
      isRecurring: false
    }])
  }

  const removeAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index))
  }

  const updateAssignment = (index: number, field: keyof DeviceAssignment, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ))
  }

  const getDeviceOptions = () => {
    return consumptionTools.map(tool => ({
      id: tool.id,
      name: tool.name,
      kwPerHour: tool.kw_per_hour
    }))
  }

  const calculateEnergyConsumption = (assignment: DeviceAssignment) => {
    const device = getDeviceOptions().find(d => d.id === assignment.deviceId)
    if (!device) return 0
    
    const consumption = device.kwPerHour * assignment.hoursUsed
    
    // Validate that the value is within reasonable bounds
    if (consumption > 999999999.99) {
      console.warn('Energy consumption value too large:', consumption)
      return 999999999.99
    }
    
    return consumption
  }

  const getTotalConsumption = () => {
    return assignments.reduce((total, assignment) => {
      return total + calculateEnergyConsumption(assignment)
    }, 0)
  }

  const getTotalGeneration = () => {
    // No power plants in schedule, only consumption tools
    return 0
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validate assignments before saving
      const validAssignments = assignments.filter(assignment => {
        if (!assignment.deviceId || !assignment.deviceName) {
          console.warn('Invalid assignment:', assignment)
          return false
        }
        return true
      })

      if (validAssignments.length === 0) {
        alert('Please add at least one valid device assignment.')
        setLoading(false)
        return
      }

      const schedules: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>[] = validAssignments.map(assignment => {
        const consumption = calculateEnergyConsumption(assignment)
        
        return {
          user_id: '', // Will be set by parent component
          date: date.toISOString().split('T')[0],
          device_id: assignment.deviceId,
          device_name: assignment.deviceName,
          device_type: 'consumption_tool' as const,
          hours_used: Math.min(Math.max(assignment.hoursUsed, 0), 24), // Validate hours
          energy_consumption: consumption,
          energy_generation: 0, // No generation for consumption tools
          is_recurring: assignment.isRecurring
        }
      })

      await onSave(schedules as Schedule[])
    } catch (error) {
      console.error('Error saving schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: EnergyStatus) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'insufficient':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusText = (status: EnergyStatus) => {
    switch (status) {
      case 'safe':
        return 'Safe - Sufficient Energy'
      case 'warning':
        return 'Warning - Borderline Energy'
      case 'insufficient':
        return 'Insufficient Energy'
      default:
        return 'Unknown Status'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(energyStatus)}`}>
                {getStatusText(energyStatus)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Energy Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Consumption</div>
              <div className="text-2xl font-bold text-blue-800">{getTotalConsumption().toFixed(1)} kWh</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Total Generation</div>
              <div className="text-2xl font-bold text-green-800">{getTotalGeneration().toFixed(1)} kWh</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Net Energy</div>
              <div className={`text-2xl font-bold ${getTotalGeneration() >= getTotalConsumption() ? 'text-green-800' : 'text-red-800'}`}>
                {(getTotalGeneration() - getTotalConsumption()).toFixed(1)} kWh
              </div>
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Apply this schedule daily (recurring)
              </span>
            </label>
          </div>

          {/* Device Assignments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Device Assignments</h3>
              <button
                onClick={addAssignment}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Device
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No devices assigned for this date
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Device Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Consumption Tool</label>
                        <select
                          value={assignment.deviceId}
                          onChange={(e) => {
                            const device = getDeviceOptions().find(d => d.id === e.target.value)
                            updateAssignment(index, 'deviceId', e.target.value)
                            updateAssignment(index, 'deviceName', device?.name || '')
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select consumption tool</option>
                          {getDeviceOptions().map(device => (
                            <option key={device.id} value={device.id}>
                              {device.name} ({device.kwPerHour} kW)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Hours Used */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hours Used</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={assignment.hoursUsed}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            // Validate hours used
                            const validatedValue = Math.min(Math.max(value, 0), 24)
                            updateAssignment(index, 'hoursUsed', validatedValue)
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-end space-x-2">
                        <button
                          onClick={() => removeAssignment(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Energy Calculation */}
                    {assignment.deviceId && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="text-gray-600">Energy Consumption:</span>
                          <span className="ml-2 font-medium">{calculateEnergyConsumption(assignment).toFixed(1)} kWh</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}
