'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PlantCard from '@/components/PlantCard'
import StorageSummary from '@/components/StorageSummary'
import DateScroll from '@/components/DateScroll'
import WeatherDetailModal from '@/components/WeatherDetailModal'
import ModalForm from '@/components/ModalForm'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading power plants and weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-green-600">
                ACEP
              </Link>
              <span className="ml-4 text-gray-600">Power Plants & Weather</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <Link
                href="/consumption"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
            <label className="text-sm font-medium text-gray-700">Location:</label>
            <span className="text-gray-900 font-medium">
              {selectedLocation?.name || 'Kariangau, Balikpapan'}
            </span>
          </div>
        </div>

        {/* Weather Forecast */}
        {weatherForecasts.length > 0 && (
          <div className="mb-8">
            <DateScroll
              forecasts={weatherForecasts}
              onDateClick={handleDateClick}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Power Plants Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Power Plants</h2>
              <button
                onClick={handleAddPlant}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Plant</span>
              </button>
            </div>

            {powerPlants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No power plants configured</h3>
                <p className="text-gray-600 mb-6">
                  Add your first power plant to start generating energy and get weather predictions
                </p>
                <button
                  onClick={handleAddPlant}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Add Your First Plant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {powerPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onEdit={handleEditPlant}
                    onDelete={handleDeletePlant}
                  />
                ))}
              </div>
            )}

            {/* Power Plants Summary */}
            {powerPlants.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {powerPlants.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Plants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalCapacity.toFixed(1)} kW
                    </div>
                    <div className="text-sm text-gray-600">Total Capacity</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Storage Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Storage Configuration</h2>
              <button
                onClick={handleAddStorage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
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
                  <StorageSummary
                    key={storage.id}
                    storage={{
                      capacity_kWh: storage.capacity_kwh,
                      current_kWh: storage.current_kwh,
                      effective_hours: 9
                    }}
                    powerPlants={powerPlants}
                    onUpdateStorage={(updatedStorage) => {
                      // Handle storage update
                      console.log('Storage updated:', updatedStorage)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No storage configured</h3>
                <p className="text-gray-600">
                  Storage configuration will be available in the next update
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {powerPlants.length}
              </div>
              <div className="text-sm text-gray-600">Power Plants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalCapacity.toFixed(1)} kW
              </div>
              <div className="text-sm text-gray-600">Total Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {weatherForecasts.length}
              </div>
              <div className="text-sm text-gray-600">Weather Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {selectedLocation?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Location</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalForm
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmitPlant}
        type="plant"
        editData={editingPlant}
      />

      <ModalForm
        isOpen={showStorageModal}
        onClose={() => {
          setShowStorageModal(false)
          setEditingStorage(null)
        }}
        onSubmit={handleSubmitStorage}
        type="storage"
        editData={editingStorage}
      />

      {selectedForecast && (
        <WeatherDetailModal
          forecast={selectedForecast}
          isOpen={showWeatherModal}
          onClose={() => setShowWeatherModal(false)}
          onSavePrediction={handleSavePrediction}
        />
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
