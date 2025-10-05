import { NextRequest, NextResponse } from 'next/server'

interface WeatherData {
  latitude: number
  longitude: number
  timezone: string
  hourly: {
    time: string[]
    weather_code: number[]
  }
}

// Removed unused interface

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get('latitude') || '-1.256')
    const longitude = parseFloat(searchParams.get('longitude') || '116.822')

    console.log('Weather API called with:', { latitude, longitude })

    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude parameter' },
        { status: 400 }
      )
    }

    // Fetch weather data from Open-Meteo API
    const weatherData = await fetchWeatherData(latitude, longitude)
    
    // Process weather data to create daily forecasts
    const processedData = processWeatherData(weatherData)
    
    return NextResponse.json(processedData)

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  // Calculate date range (current date to 14 days ahead)
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=weather_code&timezone=Asia%2FBangkok&start_date=${startDate}&end_date=${endDate}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`)
  }
  
  return response.json()
}

// Weather code mapping
export function getWeatherDescription(code: number): string {
  const weatherMap: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  }
  
  return weatherMap[code] || 'Unknown'
}

// Get weather condition for energy generation
export function getWeatherCondition(code: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (code === 0) return 'excellent'
  if (code >= 1 && code <= 3) return 'good'
  if (code >= 45 && code <= 67) return 'fair'
  return 'poor'
}

// Process weather data to create daily forecasts
function processWeatherData(weatherData: WeatherData) {
  const { hourly } = weatherData
  const dailyForecasts: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  
  // Group hourly data by date
  const dailyData: { [date: string]: { time: string[], weather_code: number[] } } = {}
  
  for (let i = 0; i < hourly.time.length; i++) {
    const date = hourly.time[i].split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = { time: [], weather_code: [] }
    }
    dailyData[date].time.push(hourly.time[i])
    dailyData[date].weather_code.push(hourly.weather_code[i])
  }
  
  // Process each day
  Object.keys(dailyData).forEach(date => {
    const dayData = dailyData[date]
    
    // Calculate average weather condition
    const avgWeatherCode = Math.round(dayData.weather_code.reduce((sum, code) => sum + code, 0) / dayData.weather_code.length)
    const weatherCondition = getWeatherCondition(avgWeatherCode)
    
    // Calculate predicted energy generation based on weather
    let predictedKwh = 0
    if (weatherCondition === 'excellent') predictedKwh = 50
    else if (weatherCondition === 'good') predictedKwh = 35
    else if (weatherCondition === 'fair') predictedKwh = 20
    else predictedKwh = 10
    
    dailyForecasts.push({
      date,
      weather_code: avgWeatherCode,
      weather_condition: weatherCondition,
      predicted_kwh: predictedKwh,
      hourly_data: {
        time: dayData.time,
        weather_code: dayData.weather_code
      }
    })
  })
  
  return dailyForecasts
}
