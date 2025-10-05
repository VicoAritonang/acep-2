// Types for energy planning data
export interface ConsumptionTool {
  id: string
  name: string
  kWh_per_hour: number
}

export interface PowerPlant {
  id: string
  name: string
  power_per_hour: number // kW
  quantity: number
}

export interface Storage {
  capacity_kWh: number
  current_kWh: number
  effective_hours: number // hours per day (e.g., 9 for 08:00-17:00)
}

export interface AssignedTool {
  toolId: string
  durationHours: number
}

export interface DaySchedule {
  assignedTools: AssignedTool[]
  recurrence: 'once' | 'daily'
}

export interface AppState {
  consumptionTools: ConsumptionTool[]
  powerPlants: PowerPlant[]
  storage: Storage
  schedule: Record<string, DaySchedule>
}

// Helper functions for energy calculations

export function calculateDailyGeneration(plants: PowerPlant[], effectiveHours: number): number {
  return plants.reduce((total, plant) => {
    return total + (plant.power_per_hour * plant.quantity * effectiveHours)
  }, 0)
}

export function calculateConsumptionForDate(
  schedule: DaySchedule | undefined,
  tools: ConsumptionTool[]
): number {
  if (!schedule || !schedule.assignedTools.length) return 0

  return schedule.assignedTools.reduce((total, assigned) => {
    const tool = tools.find(t => t.id === assigned.toolId)
    if (!tool) return total
    return total + (tool.kWh_per_hour * assigned.durationHours)
  }, 0)
}

export function calculateStorageForecast(
  dates: string[],
  generation: number,
  consumption: number,
  initialStorage: number
): { date: string; storage: number; status: 'green' | 'yellow' | 'red' }[] {
  const results: { date: string; storage: number; status: 'green' | 'yellow' | 'red' }[] = []
  let currentStorage = initialStorage

  for (const date of dates) {
    // Add today's generation
    currentStorage += generation
    
    // Check if we have enough energy
    const hasEnoughEnergy = currentStorage >= consumption
    
    // Determine status
    let status: 'green' | 'yellow' | 'red'
    if (hasEnoughEnergy) {
      status = 'green'
    } else if (currentStorage + generation >= consumption) {
      status = 'yellow'
    } else {
      status = 'red'
    }
    
    // Subtract consumption
    currentStorage = Math.max(0, currentStorage - consumption)
    
    results.push({
      date,
      storage: currentStorage,
      status
    })
  }

  return results
}

export function getPredictionStatus(
  storage: number,
  generation: number,
  consumption: number
): 'green' | 'yellow' | 'red' {
  if (storage >= consumption) {
    return 'green'
  } else if (storage + generation >= consumption) {
    return 'yellow'
  } else {
    return 'red'
  }
}

// localStorage helpers
export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return {
      consumptionTools: [],
      powerPlants: [],
      storage: {
        capacity_kWh: 1000,
        current_kWh: 500,
        effective_hours: 9
      },
      schedule: {}
    }
  }

  const stored = localStorage.getItem('acep-app-state')
  if (!stored) {
    return {
      consumptionTools: [],
      powerPlants: [],
      storage: {
        capacity_kWh: 1000,
        current_kWh: 500,
        effective_hours: 9
      },
      schedule: {}
    }
  }

  return JSON.parse(stored)
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('acep-app-state', JSON.stringify(state))
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  
  return days
}

export function getStatusColor(status: 'green' | 'yellow' | 'red'): string {
  switch (status) {
    case 'green':
      return 'bg-green-100 border-green-300 text-green-800'
    case 'yellow':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'red':
      return 'bg-red-100 border-red-300 text-red-800'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800'
  }
}
