'use client'

import { useState } from 'react'
import { formatDate, type AppState, type AssignedTool } from '@/lib/utils'

interface DayCardProps {
  date: Date
  appState: AppState
  onClose: () => void
  onUpdateSchedule: (date: Date, assignedTools: AssignedTool[], recurrence: 'once' | 'daily') => void
}

export default function DayCard({ date, appState, onClose, onUpdateSchedule }: DayCardProps) {
  const dateString = formatDate(date)
  const schedule = appState.schedule[dateString]
  const [assignedTools, setAssignedTools] = useState<AssignedTool[]>(
    schedule?.assignedTools || []
  )
  const [recurrence, setRecurrence] = useState<'once' | 'daily'>(
    schedule?.recurrence || 'once'
  )

  // Calculate daily consumption
  const dailyConsumption = assignedTools.reduce((total, assigned) => {
    const tool = appState.consumptionTools.find(t => t.id === assigned.toolId)
    if (!tool) return total
    return total + (tool.kWh_per_hour * assigned.durationHours)
  }, 0)

  // Calculate daily generation
  const dailyGeneration = appState.powerPlants.reduce((total, plant) => {
    return total + (plant.power_per_hour * plant.quantity * appState.storage.effective_hours)
  }, 0)

  // Calculate prediction status
  const currentStorage = appState.storage.current_kWh
  let status: 'green' | 'yellow' | 'red'
  let statusText: string

  if (currentStorage >= dailyConsumption) {
    status = 'green'
    statusText = 'Sufficient storage available'
  } else if (currentStorage + dailyGeneration >= dailyConsumption) {
    status = 'yellow'
    statusText = 'Borderline - needs today\'s generation'
  } else {
    status = 'red'
    statusText = 'Energy deficit - insufficient generation'
  }

  const addTool = () => {
    if (appState.consumptionTools.length === 0) {
      alert('No consumption tools available. Please add tools first.')
      return
    }
    
    setAssignedTools([...assignedTools, {
      toolId: appState.consumptionTools[0].id,
      durationHours: 1
    }])
  }

  const removeTool = (index: number) => {
    setAssignedTools(assignedTools.filter((_, i) => i !== index))
  }

  const updateTool = (index: number, field: 'toolId' | 'durationHours', value: string | number) => {
    const updated = [...assignedTools]
    updated[index] = { ...updated[index], [field]: value }
    setAssignedTools(updated)
  }

  const saveSchedule = () => {
    onUpdateSchedule(date, assignedTools, recurrence)
    onClose()
  }

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'yellow':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'red':
        return 'bg-red-100 border-red-300 text-red-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Summary */}
          <div className={`p-4 rounded-lg border-2 mb-6 ${getStatusColor(status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Energy Status</h4>
                <p className="text-sm">{statusText}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Storage: {currentStorage.toFixed(1)} kWh</p>
                <p className="text-sm">Generation: {dailyGeneration.toFixed(1)} kWh</p>
                <p className="text-sm">Consumption: {dailyConsumption.toFixed(1)} kWh</p>
              </div>
            </div>
          </div>

          {/* Assigned Tools */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Assigned Tools</h4>
              <button
                onClick={addTool}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Tool
              </button>
            </div>

            {assignedTools.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tools assigned for this day</p>
            ) : (
              <div className="space-y-3">
                {assignedTools.map((assigned, index) => {
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <select
                          value={assigned.toolId}
                          onChange={(e) => updateTool(index, 'toolId', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {appState.consumptionTools.map(tool => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name} ({tool.kWh_per_hour} kWh/h)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={assigned.durationHours}
                          onChange={(e) => updateTool(index, 'durationHours', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Hours"
                        />
                      </div>
                      <button
                        onClick={() => removeTool(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recurrence Setting */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Recurrence</h4>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="once"
                  checked={recurrence === 'once'}
                  onChange={(e) => setRecurrence(e.target.value as 'once' | 'daily')}
                  className="mr-2"
                />
                Once
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="daily"
                  checked={recurrence === 'daily'}
                  onChange={(e) => setRecurrence(e.target.value as 'once' | 'daily')}
                  className="mr-2"
                />
                Daily Repeat
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSchedule}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
