'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Chatbot from '@/components/chatbot/Chatbot'
import { useUser } from '@/contexts/UserContext'
import { 
  db,
  type PowerPlant,
  type StorageUnit
} from '@/lib/supabaseClient'

export default function PowerPlantsPage() {
  const { user, login, loading: userLoading } = useUser()
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([])
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([])
  const [weatherForecasts, setWeatherForecasts] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedLocation, setSelectedLocation] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedForecast, setSelectedForecast] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showWeatherModal, setShowWeatherModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [editingPlant, setEditingPlant] = useState<PowerPlant | null>(null)
  const [editingStorage, setEditingStorage] = useState<StorageUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [user, userLoading, login]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Auto-login if not logged in
      if (!user && !userLoading) {
        await login()
        return
      }
      
      if (!user) {
        setError('Please login first')
        return
      }
      
      // Load power plants and storage units for current user
      const [plants, storage] = await Promise.all([
        db.getPowerPlants(user.id),
        db.getStorageUnits(user.id)
      ])
      
      setPowerPlants(plants)
      setStorageUnits(storage)
      
      // Set default location from user data
      const defaultLoc = {
        id: user.id,
        name: 'Kariangau, Balikpapan',
        latitude: user.latitude,
        longitude: user.longitude,
        is_default: true,
        created_at: user.created_at
      }
      setSelectedLocation(defaultLoc)
      
      // Load weather forecasts
      await loadWeatherForecasts(defaultLoc)
      
    } catch (err) {
      setError('Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadWeatherForecasts = async (location: { latitude: number; longitude: number }) => {
    try {
      console.log('Loading weather forecasts for location:', location)
      
      if (!location.latitude || !location.longitude) {
        console.error('Invalid location data:', location)
        return
      }
      
      const response = await fetch(
        `/api/weather?latitude=${location.latitude}&longitude=${location.longitude}`
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log('Weather data received:', data)
        setWeatherForecasts(data || [])
      } else {
        console.error('Failed to load weather forecasts, status:', response.status)
      }
    } catch (err) {
      console.error('Error loading weather forecasts:', err)
    }
  }

  // Location change is handled automatically based on user data

  const handleDateClick = (forecast: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setSelectedForecast(forecast)
    setShowWeatherModal(true)
  }

  const handleSavePrediction = async (forecast: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Weather forecasts are fetched in real-time, no need to save
    console.log('Weather forecast:', forecast)
  }

  const handleAddPlant = () => {
    setEditingPlant(null)
    setShowModal(true)
  }

  const handleAddStorage = () => {
    setEditingStorage(null)
    setShowStorageModal(true)
  }

  // const handleEditStorage = (storage: StorageUnit) => {
  //   setEditingStorage(storage)
  //   setShowStorageModal(true)
  // }

  // const handleDeleteStorage = async (storageId: string) => {
  //   if (confirm('Are you sure you want to delete this storage unit?')) {
  //     try {
  //       await db.deleteStorageUnit(storageId)
  //       setStorageUnits(prev => prev.filter(storage => storage.id !== storageId))
  //     } catch (err) {
  //       console.error('Error deleting storage:', err)
  //     }
  //   }
  // }

  const handleEditPlant = (plant: PowerPlant) => {
    setEditingPlant(plant)
    setShowModal(true)
  }

  const handleDeletePlant = async (plantId: string) => {
    if (confirm('Are you sure you want to delete this power plant?')) {
      try {
        await db.deletePowerPlant(plantId)
        setPowerPlants(prev => prev.filter(plant => plant.id !== plantId))
      } catch (err) {
        console.error('Error deleting plant:', err)
      }
    }
  }

  const handleSubmitPlant = async (data: Omit<PowerPlant, 'id' | 'created_at' | 'user_id'>) => {
    try {
      if (!user) {
        setError('Please login first')
        return
      }

      const plantData = {
        ...data,
        user_id: user.id
      }

      if (editingPlant) {
        const updated = await db.updatePowerPlant(editingPlant.id, plantData)
        setPowerPlants(prev => prev.map(plant => plant.id === editingPlant.id ? updated : plant))
      } else {
        const newPlant = await db.createPowerPlant(plantData)
        setPowerPlants(prev => [newPlant, ...prev])
      }
      setShowModal(false)
      setEditingPlant(null)
    } catch (err) {
      console.error('Error saving plant:', err)
      setError('Failed to save power plant. Please try again.')
    }
  }

  const handleSubmitStorage = async (data: Omit<StorageUnit, 'id' | 'created_at' | 'user_id'>) => {
    try {
      if (!user) {
        setError('Please login first')
        return
      }

      const storageData = {
        ...data,
        user_id: user.id
      }

      if (editingStorage) {
        const updated = await db.updateStorageUnit(editingStorage.id, storageData)
        setStorageUnits(prev => prev.map(storage => storage.id === editingStorage.id ? updated : storage))
      } else {
        const newStorage = await db.createStorageUnit(storageData)
        setStorageUnits(prev => [newStorage, ...prev])
      }
      setShowStorageModal(false)
      setEditingStorage(null)
    } catch (err) {
      console.error('Error saving storage:', err)
      setError('Failed to save storage unit. Please try again.')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPlant(null)
  }

  const totalCapacity = powerPlants.reduce((total, plant) => {
    return total + (plant.kw_per_hour * plant.quantity)
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading power plants and weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center bg-gray-900/70 border border-red-500/30 rounded-2xl px-8 py-10 shadow-2xl">
          <div className="text-red-400 text-xl font-semibold mb-2">Unable to load data</div>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                ACEP
              </Link>
              <span className="ml-4 text-gray-400">Power Plants & Weather</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                &larr; Back to Dashboard
              </Link>
              <Link
                href="/consumption"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Consumption Tools
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Display */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-400">Location:</label>
            <span className="text-white font-medium">
              {selectedLocation?.name || 'Kariangau, Balikpapan'}
            </span>
          </div>
        </div>

        {/* Weather Forecast */}
        {weatherForecasts.length > 0 && (
          <div className="mb-8 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">14-Day Weather Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weatherForecasts.slice(0, 7).map((forecast) => (
                <div key={forecast.date} className="text-center p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-emerald-500/30 transition-all duration-300">
                  <div className="text-sm text-gray-400 mb-2">
                    {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-white mb-2">
                    {new Date(forecast.date).getDate()}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {forecast.weather_condition || 'Unknown'}
                  </div>
                  <div className="text-sm font-semibold text-emerald-400">
                    {forecast.predicted_kwh || 0} kWh
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Power Plants Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Power Plants</h2>
              <button
                onClick={handleAddPlant}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Plant</span>
              </button>
            </div>

            {powerPlants.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl">
                <div className="mx-auto w-24 h-24 bg-gray-800/60 rounded-full border border-gray-700 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No power plants configured</h3>
                <p className="text-gray-400 mb-6">
                  Add your first power plant to start generating energy and get weather predictions
                </p>
                <button
                  onClick={handleAddPlant}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  Add Your First Plant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {powerPlants.map((plant) => (
                  <div key={plant.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{plant.name}</h3>
                          <p className="text-sm text-gray-400">Power Plant</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPlant(plant)}
                          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-800/60 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePlant(plant.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/60 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Power per Hour</p>
                        <p className="text-xl font-bold text-emerald-400">{plant.kw_per_hour} kW</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Quantity</p>
                        <p className="text-xl font-bold text-cyan-400">{plant.quantity}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-sm text-gray-400">Total Capacity</p>
                      <p className="text-lg font-semibold text-white">{(plant.kw_per_hour * plant.quantity).toFixed(1)} kW</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Power Plants Summary */}
            {powerPlants.length > 0 && (
              <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Generation Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                      {powerPlants.length}
                    </div>
                    <div className="text-sm text-gray-400">Total Plants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {totalCapacity.toFixed(1)} kW
                    </div>
                    <div className="text-sm text-gray-400">Total Capacity</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Storage Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Storage Configuration</h2>
              <button
                onClick={handleAddStorage}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)] flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Storage</span>
              </button>
            </div>
            {storageUnits.length > 0 ? (
              <div className="space-y-4">
                {storageUnits.map((storage) => (
                  <div key={storage.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{storage.name}</h3>
                          <p className="text-sm text-gray-400">Storage Unit</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Capacity</p>
                        <p className="text-xl font-bold text-cyan-400">{storage.capacity_kwh} kWh</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Current Level</p>
                        <p className="text-xl font-bold text-emerald-400">{storage.current_kwh} kWh</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Usage</span>
                        <span>{((storage.current_kwh / storage.capacity_kwh) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-800/60 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(storage.current_kwh / storage.capacity_kwh) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl">
                <div className="mx-auto w-24 h-24 bg-gray-800/60 rounded-full border border-gray-700 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No storage configured</h3>
                <p className="text-gray-400">
                  Storage configuration will be available in the next update
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                {powerPlants.length}
              </div>
              <div className="text-sm text-gray-400">Power Plants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {totalCapacity.toFixed(1)} kW
              </div>
              <div className="text-sm text-gray-400">Total Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {weatherForecasts.length}
              </div>
              <div className="text-sm text-gray-400">Weather Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {selectedLocation?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Location</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Form Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingPlant ? 'Edit Power Plant' : 'Add New Power Plant'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = {
                  name: formData.get('name') as string,
                  kw_per_hour: parseFloat(formData.get('kw_per_hour') as string),
                  quantity: parseInt(formData.get('quantity') as string)
                }
                handleSubmitPlant(data)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Plant Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingPlant?.name || ''}
                      className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Power (kW/h)</label>
                    <input
                      type="number"
                      name="kw_per_hour"
                      step="0.1"
                      min="0"
                      defaultValue={editingPlant?.kw_per_hour || ''}
                      className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      defaultValue={editingPlant?.quantity || ''}
                      className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  >
                    {editingPlant ? 'Update' : 'Add'} Plant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showStorageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingStorage ? 'Edit Storage Unit' : 'Add New Storage Unit'}
                </h3>
                <button
                  onClick={() => {
                    setShowStorageModal(false)
                    setEditingStorage(null)
                  }}
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = {
                  name: formData.get('name') as string,
                  capacity_kwh: parseFloat(formData.get('capacity_kwh') as string),
                  current_kwh: parseFloat(formData.get('current_kwh') as string)
                }
                handleSubmitStorage(data)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Storage Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingStorage?.name || ''}
                      className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Capacity (kWh)</label>
                    <input
                      type="number"
                      name="capacity_kwh"
                      step="0.1"
                      min="0"
                      defaultValue={editingStorage?.capacity_kwh || ''}
                      className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Level (kWh)</label>
                    <input
                      type="number"
                      name="current_kwh"
                      step="0.1"
                      min="0"
                      defaultValue={editingStorage?.current_kwh || ''}
                      className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStorageModal(false)
                      setEditingStorage(null)
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                  >
                    {editingStorage ? 'Update' : 'Add'} Storage
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
