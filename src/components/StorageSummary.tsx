'use client'

import { type Storage } from '@/lib/utils'
import { type PowerPlant } from '@/lib/supabaseClient'

interface StorageSummaryProps {
  storage: Storage
  powerPlants: PowerPlant[]
  onUpdateStorage: (storage: Storage) => void
}

export default function StorageSummary({ storage, powerPlants, onUpdateStorage }: StorageSummaryProps) {
  const totalDailyGeneration = powerPlants.reduce((total, plant) => {
    return total + (plant.kw_per_hour * plant.quantity * storage.effective_hours)
  }, 0)

  const storagePercentage = (storage.current_kWh / storage.capacity_kWh) * 100

  const updateStorage = (field: keyof Storage, value: number) => {
    onUpdateStorage({
      ...storage,
      [field]: value
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Configuration</h3>
      
      <div className="space-y-4">
        {/* Storage Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Storage Capacity (kWh)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={storage.capacity_kWh}
            onChange={(e) => updateStorage('capacity_kWh', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Current Storage Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Storage Level (kWh)
          </label>
          <input
            type="number"
            min="0"
            max={storage.capacity_kWh}
            step="10"
            value={storage.current_kWh}
            onChange={(e) => updateStorage('current_kWh', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Effective Collection Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective Collection Hours (per day)
          </label>
          <input
            type="number"
            min="1"
            max="24"
            step="0.5"
            value={storage.effective_hours}
            onChange={(e) => updateStorage('effective_hours', parseFloat(e.target.value) || 1)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Storage Level Indicator */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Storage Level</span>
            <span className="text-sm text-gray-600">{storagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                storagePercentage > 80 ? 'bg-green-500' :
                storagePercentage > 50 ? 'bg-yellow-500' :
                storagePercentage > 20 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 kWh</span>
            <span>{storage.capacity_kWh} kWh</span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalDailyGeneration.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Daily Generation (kWh)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {storage.current_kWh.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Current Storage (kWh)</div>
          </div>
        </div>

        {/* Collection Time Display */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Collection Time: 08:00–17:00 ({storage.effective_hours} hours)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
