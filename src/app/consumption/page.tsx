'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { 
  db,
  type ConsumptionTool
} from '@/lib/supabaseClient'

export default function ConsumptionPage() {
  const { user, login, loading: userLoading } = useUser()
  const [consumptionTools, setConsumptionTools] = useState<ConsumptionTool[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTool, setEditingTool] = useState<ConsumptionTool | null>(null)
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
      
      // Load consumption tools for current user
      const tools = await db.getConsumptionTools(user.id)
      setConsumptionTools(tools)
      
    } catch (err) {
      setError('Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTool = () => {
    setEditingTool(null)
    setShowModal(true)
  }

  const handleEditTool = (tool: ConsumptionTool) => {
    setEditingTool(tool)
    setShowModal(true)
  }

  const handleDeleteTool = async (toolId: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      try {
        await db.deleteConsumptionTool(toolId)
        setConsumptionTools(prev => prev.filter(tool => tool.id !== toolId))
      } catch (err) {
        console.error('Error deleting tool:', err)
      }
    }
  }

  const handleSubmitTool = async (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      if (!user) {
        setError('Please login first')
        return
      }

      const toolData = {
        ...data,
        user_id: user.id
      }

      if (editingTool) {
        // Update existing tool
        const updated = await db.updateConsumptionTool(editingTool.id, toolData)
        setConsumptionTools(prev => prev.map(tool => tool.id === editingTool.id ? updated : tool))
      } else {
        // Add new tool
        const newTool = await db.createConsumptionTool(toolData)
        setConsumptionTools(prev => [newTool, ...prev])
      }
      setShowModal(false)
      setEditingTool(null)
    } catch (err) {
      console.error('Error saving tool:', err)
      setError('Failed to save tool. Please try again.')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTool(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-emerald-400 tracking-wide hover:text-emerald-300 transition-all duration-300">
                ACEP
              </Link>
              <span className="ml-4 text-gray-400">Consumption Tools</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                ← Back to Dashboard
              </Link>
              <Link
                href="/powerplants"
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
              >
                Power Plants
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">Consumption Tools</h1>
              <p className="text-gray-400 mt-2 leading-relaxed">
                Manage your power-consuming equipment and their energy usage
              </p>
            </div>
            <button
              onClick={handleAddTool}
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Tool</span>
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading consumption tools...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</div>
            <button
              onClick={loadData}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            >
              Try Again
            </button>
          </div>
        ) : consumptionTools.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-800/50 border border-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No consumption tools configured</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Add your first consumption tool to start planning your energy usage
            </p>
            <button
              onClick={handleAddTool}
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            >
              Add Your First Tool
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consumptionTools.map((tool) => (
              <div key={tool.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-6 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTool(tool)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTool(tool.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                <div className="text-2xl font-bold text-blue-400 mb-1">{tool.kw_per_hour} kW</div>
                <p className="text-sm text-gray-400">Energy consumption per hour</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {consumptionTools.length > 0 && (
          <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-6 hover:border-emerald-500/30 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
                <div className="text-2xl font-bold text-blue-400">
                  {consumptionTools.length}
                </div>
                <div className="text-sm text-gray-400">Total Tools</div>
              </div>
              <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300">
                <div className="text-2xl font-bold text-emerald-400">
                  {consumptionTools.reduce((total, tool) => total + tool.kw_per_hour, 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Total Energy Usage (kWh/h)</div>
              </div>
              <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300">
                <div className="text-2xl font-bold text-purple-400">
                  {consumptionTools.length > 0 
                    ? (consumptionTools.reduce((total, tool) => total + tool.kw_per_hour, 0) / consumptionTools.length).toFixed(1)
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-400">Average Usage per Tool (kWh/h)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simple Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTool ? 'Edit Tool' : 'Add New Tool'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
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
                  kw_per_hour: parseFloat(formData.get('kw_per_hour') as string)
                }
                handleSubmitTool(data)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingTool?.name || ''}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Power (kW/h)</label>
                    <input
                      type="number"
                      name="kw_per_hour"
                      step="0.1"
                      min="0"
                      defaultValue={editingTool?.kw_per_hour || ''}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingTool ? 'Update' : 'Add'} Tool
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
