'use client'

import { useState, useEffect } from 'react'
import { type ConsumptionTool, type PowerPlant, type StorageUnit } from '@/lib/supabaseClient'

interface ModalFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  type: 'tool' | 'plant' | 'storage'
  editData?: ConsumptionTool | PowerPlant | StorageUnit | null
}

export default function ModalForm({ isOpen, onClose, onSubmit, type, editData }: ModalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    kw_per_hour: 0,
    quantity: 1,
    capacity_kwh: 0,
    current_kwh: 0
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        kw_per_hour: 'kw_per_hour' in editData ? editData.kw_per_hour : 0,
        quantity: 'quantity' in editData ? editData.quantity : 1,
        capacity_kwh: 'capacity_kwh' in editData ? editData.capacity_kwh : 0,
        current_kwh: 'current_kwh' in editData ? editData.current_kwh : 0
      })
    } else {
      setFormData({
        name: '',
        kw_per_hour: 0,
        quantity: 1,
        capacity_kwh: 0,
        current_kwh: 0
      })
    }
  }, [editData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === 'tool') {
      onSubmit({
        name: formData.name,
        kw_per_hour: formData.kw_per_hour
      })
    } else if (type === 'plant') {
      onSubmit({
        name: formData.name,
        kw_per_hour: formData.kw_per_hour,
        quantity: formData.quantity
      })
    } else if (type === 'storage') {
      onSubmit({
        name: formData.name,
        capacity_kwh: formData.capacity_kwh,
        current_kwh: formData.current_kwh
      })
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white tracking-wide">
              {editData ? 'Edit' : 'Add'} {type === 'tool' ? 'Consumption Tool' : type === 'plant' ? 'Power Plant' : 'Storage Unit'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {type === 'tool' ? 'Tool Name' : type === 'plant' ? 'Plant Name' : 'Storage Name'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-700 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                placeholder={type === 'tool' ? 'e.g., Excavator A' : type === 'plant' ? 'e.g., Solar Panel Array 1' : 'e.g., Battery Bank 1'}
              />
            </div>

            {/* Energy/Power Field */}
            {type !== 'storage' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {type === 'tool' ? 'Energy Usage (kW per hour)' : 'Power Output (kW per unit)'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.kw_per_hour}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    kw_per_hour: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full p-3 border border-gray-700 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                  placeholder="0.0"
                />
              </div>
            )}

            {/* Storage Fields */}
            {type === 'storage' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacity (kWh)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.capacity_kwh}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      capacity_kwh: parseFloat(e.target.value) || 0 
                    })}
                    className="w-full p-3 border border-gray-700 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Level (kWh)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.current_kwh}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      current_kwh: parseFloat(e.target.value) || 0 
                    })}
                    className="w-full p-3 border border-gray-700 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
                    placeholder="0.0"
                  />
                </div>
              </>
            )}

            {/* Quantity Field (only for plants) */}
            {type === 'plant' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border border-gray-700 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                />
              </div>
            )}

            {/* Total Calculation (for plants) */}
            {type === 'plant' && formData.kw_per_hour > 0 && formData.quantity > 0 && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-3">
                <div className="text-sm text-blue-400">
                  <strong>Total Power:</strong> {(formData.kw_per_hour * formData.quantity).toFixed(1)} kW
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
              >
                {editData ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
