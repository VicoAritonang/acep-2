import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  role: string
  latitude: number
  longitude: number
  created_at: string
}

export interface ConsumptionTool {
  id: string
  user_id: string
  name: string
  kw_per_hour: number
  created_at: string
}

export interface PowerPlant {
  id: string
  user_id: string
  name: string
  kw_per_hour: number
  quantity: number
  created_at: string
}

export interface StorageUnit {
  id: string
  user_id: string
  name: string
  capacity_kwh: number
  current_kwh: number
  created_at: string
}

export interface ChatHistory {
  session_id: string
  user_id: string
  full_name: string
  chat: string
  output: string | null
  created_at: string
}

export interface Schedule {
  id: string
  user_id: string
  date: string
  device_id: string
  device_name: string
  device_type: 'consumption_tool' | 'power_plant'
  hours_used: number
  energy_consumption: number
  energy_generation: number
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export type EnergyStatus = 'safe' | 'warning' | 'insufficient'

// Database operations
export const db = {
  // Users
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) return null
    return data
  },

  async getDemoUser(): Promise<User | null> {
    console.log('Getting demo user...')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@acep.app')
      .single()
    
    if (error) {
      console.error('Error getting demo user:', error)
      return null
    }
    console.log('Demo user found:', data)
    return data
  },

  // Consumption Tools
  async getConsumptionTools(userId: string): Promise<ConsumptionTool[]> {
    const { data, error } = await supabase
      .from('consumption_tools')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createConsumptionTool(tool: Omit<ConsumptionTool, 'id' | 'created_at'>): Promise<ConsumptionTool> {
    console.log('Creating consumption tool with data:', tool)
    const { data, error } = await supabase
      .from('consumption_tools')
      .insert({
        user_id: tool.user_id,
        name: tool.name,
        kw_per_hour: tool.kw_per_hour
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating consumption tool:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }
    console.log('Consumption tool created successfully:', data)
    return data
  },

  async updateConsumptionTool(id: string, tool: Partial<ConsumptionTool>): Promise<ConsumptionTool> {
    const { data, error } = await supabase
      .from('consumption_tools')
      .update(tool)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteConsumptionTool(id: string): Promise<void> {
    const { error } = await supabase
      .from('consumption_tools')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Power Plants
  async getPowerPlants(userId: string): Promise<PowerPlant[]> {
    const { data, error } = await supabase
      .from('power_plants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createPowerPlant(plant: Omit<PowerPlant, 'id' | 'created_at'>): Promise<PowerPlant> {
    console.log('Creating power plant with data:', plant)
    const { data, error } = await supabase
      .from('power_plants')
      .insert({
        user_id: plant.user_id,
        name: plant.name,
        kw_per_hour: plant.kw_per_hour,
        quantity: plant.quantity
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating power plant:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }
    console.log('Power plant created successfully:', data)
    return data
  },

  async updatePowerPlant(id: string, plant: Partial<PowerPlant>): Promise<PowerPlant> {
    const { data, error } = await supabase
      .from('power_plants')
      .update(plant)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deletePowerPlant(id: string): Promise<void> {
    const { error } = await supabase
      .from('power_plants')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Storage Units
  async getStorageUnits(userId: string): Promise<StorageUnit[]> {
    const { data, error } = await supabase
      .from('storage_units')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createStorageUnit(storage: Omit<StorageUnit, 'id' | 'created_at'>): Promise<StorageUnit> {
    const { data, error } = await supabase
      .from('storage_units')
      .insert(storage)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating storage unit:', error)
      throw error
    }
    return data
  },

  async updateStorageUnit(id: string, storage: Partial<StorageUnit>): Promise<StorageUnit> {
    const { data, error } = await supabase
      .from('storage_units')
      .update(storage)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Chat History
  async saveChatHistory(chat: Omit<ChatHistory, 'created_at'>): Promise<ChatHistory> {
    const { data, error } = await supabase
      .from('chat_history')
      .insert(chat)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getChatHistory(userId: string): Promise<ChatHistory[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Schedules
  async getSchedules(userId: string, startDate?: string, endDate?: string): Promise<Schedule[]> {
    let query = supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSchedule(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .update(schedule)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteScheduleByDate(userId: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', userId)
      .eq('date', date)
    
    if (error) throw error
  }
}
