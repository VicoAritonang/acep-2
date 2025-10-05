import { type Schedule, type StorageUnit, type EnergyStatus } from './supabaseClient'

export interface EnergyCalculationResult {
  date: string
  status: EnergyStatus
  storageBefore: number
  storageAfter: number
  totalConsumption: number
  totalGeneration: number
  netEnergy: number
  isSafe: boolean
  isWarning: boolean
  isInsufficient: boolean
}

export interface EnergyStatusMap {
  [date: string]: EnergyStatus
}

/**
 * Calculate energy status for a specific date
 * @param date - The date to calculate for
 * @param schedules - All schedules for the user
 * @param storageUnits - All storage units for the user
 * @param previousResult - Previous day's calculation result (for cumulative effect)
 * @returns EnergyCalculationResult
 */
export function calculateEnergyStatus(
  date: string,
  schedules: Schedule[],
  storageUnits: StorageUnit[],
  previousResult?: EnergyCalculationResult
): EnergyCalculationResult {
  // Get schedules for this specific date
  const daySchedules = schedules.filter(schedule => schedule.date === date)
  
  // Calculate total consumption and generation for this day
  const totalConsumption = daySchedules
    .filter(schedule => schedule.device_type === 'consumption_tool')
    .reduce((sum, schedule) => sum + schedule.energy_consumption, 0)
  
  const totalGeneration = daySchedules
    .filter(schedule => schedule.device_type === 'power_plant')
    .reduce((sum, schedule) => sum + schedule.energy_generation, 0)
  
  const netEnergy = totalGeneration - totalConsumption
  
  // Calculate storage levels
  const totalStorageCapacity = storageUnits.reduce((sum, unit) => sum + unit.capacity_kwh, 0)
  const initialStorage = previousResult ? previousResult.storageAfter : 
    storageUnits.reduce((sum, unit) => sum + unit.current_kwh, 0)
  
  // Storage after this day's operations
  const storageAfter = Math.max(0, Math.min(totalStorageCapacity, initialStorage + netEnergy))
  
  // Determine energy status based on the algorithm:
  // 1. Green (Safe): Storage >= Consumption
  // 2. Yellow (Warning): Storage + Generation >= Consumption
  // 3. Red (Insufficient): Storage + Generation < Consumption
  
  let status: EnergyStatus = 'safe'
  let isSafe = false
  let isWarning = false
  let isInsufficient = false
  
  if (initialStorage >= totalConsumption) {
    // Green: Storage is sufficient for consumption
    status = 'safe'
    isSafe = true
  } else if (initialStorage + totalGeneration >= totalConsumption) {
    // Yellow: Storage + generation is sufficient
    status = 'warning'
    isWarning = true
  } else {
    // Red: Insufficient energy even with generation
    status = 'insufficient'
    isInsufficient = true
  }
  
  return {
    date,
    status,
    storageBefore: initialStorage,
    storageAfter,
    totalConsumption,
    totalGeneration,
    netEnergy,
    isSafe,
    isWarning,
    isInsufficient
  }
}

/**
 * Calculate energy status for a range of dates
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param schedules - All schedules for the user
 * @param storageUnits - All storage units for the user
 * @returns Map of date to energy status
 */
export function calculateEnergyStatusRange(
  startDate: string,
  endDate: string,
  schedules: Schedule[],
  storageUnits: StorageUnit[]
): EnergyStatusMap {
  const statusMap: EnergyStatusMap = {}
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  let previousResult: EnergyCalculationResult | undefined
  
  // Iterate through each date in the range
  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const dateString = current.toISOString().split('T')[0]
    const result = calculateEnergyStatus(dateString, schedules, storageUnits, previousResult)
    statusMap[dateString] = result.status
    previousResult = result
  }
  
  return statusMap
}

/**
 * Get energy status for a specific date
 * @param date - Date string (YYYY-MM-DD)
 * @param schedules - All schedules for the user
 * @param storageUnits - All storage units for the user
 * @returns EnergyStatus
 */
export function getEnergyStatus(
  date: string,
  schedules: Schedule[],
  storageUnits: StorageUnit[]
): EnergyStatus {
  const result = calculateEnergyStatus(date, schedules, storageUnits)
  return result.status
}

/**
 * Get detailed energy calculation for a specific date
 * @param date - Date string (YYYY-MM-DD)
 * @param schedules - All schedules for the user
 * @param storageUnits - All storage units for the user
 * @param previousResult - Previous day's result (optional)
 * @returns EnergyCalculationResult
 */
export function getDetailedEnergyCalculation(
  date: string,
  schedules: Schedule[],
  storageUnits: StorageUnit[],
  previousResult?: EnergyCalculationResult
): EnergyCalculationResult {
  return calculateEnergyStatus(date, schedules, storageUnits, previousResult)
}

/**
 * Calculate cumulative energy status for multiple days
 * This implements the algorithm where each day's storage is affected by previous days
 * @param dates - Array of date strings
 * @param schedules - All schedules for the user
 * @param storageUnits - All storage units for the user
 * @returns Array of EnergyCalculationResult
 */
export function calculateCumulativeEnergyStatus(
  dates: string[],
  schedules: Schedule[],
  storageUnits: StorageUnit[]
): EnergyCalculationResult[] {
  const results: EnergyCalculationResult[] = []
  let previousResult: EnergyCalculationResult | undefined
  
  for (const date of dates) {
    const result = calculateEnergyStatus(date, schedules, storageUnits, previousResult)
    results.push(result)
    previousResult = result
  }
  
  return results
}

/**
 * Get energy status summary for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param schedules - All schedules for the user
 * @param storageUnits - All storage units for the user
 * @returns Summary with counts of each status
 */
export function getEnergyStatusSummary(
  startDate: string,
  endDate: string,
  schedules: Schedule[],
  storageUnits: StorageUnit[]
): {
  totalDays: number
  safeDays: number
  warningDays: number
  insufficientDays: number
  statusMap: EnergyStatusMap
} {
  const statusMap = calculateEnergyStatusRange(startDate, endDate, schedules, storageUnits)
  const statuses = Object.values(statusMap)
  
  return {
    totalDays: statuses.length,
    safeDays: statuses.filter(status => status === 'safe').length,
    warningDays: statuses.filter(status => status === 'warning').length,
    insufficientDays: statuses.filter(status => status === 'insufficient').length,
    statusMap
  }
}
