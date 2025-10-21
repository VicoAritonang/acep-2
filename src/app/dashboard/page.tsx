'use client'

import { useState, useEffect, useMemo, useCallback, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { Battery, Zap, TrendingUp, Settings, AlertTriangle } from 'lucide-react';
import Chatbot from '@/components/chatbot/Chatbot';
import { useUser } from '@/contexts/UserContext';
import { db, type Schedule } from '@/lib/supabaseClient';

const mockData = {
  totalPowerCapacity: 45.5,
  storageUsage: 67.8,
  totalConsumptionCapacity: 38.2,
  energyStatus: 'green',
  statusText: 'Sufficient Generation Capacity',
  totalStorageCapacity: 150.0,
  totalCurrentStorage: 101.7
};

export default function ACEPDashboard() {
  const { user, login, loading: userLoading } = useUser();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formDeviceName, setFormDeviceName] = useState('');
  const [formDeviceType, setFormDeviceType] = useState<'consumption_tool' | 'power_plant'>('consumption_tool');
  const [formHoursUsed, setFormHoursUsed] = useState<number>(1);
  const [formEnergyValue, setFormEnergyValue] = useState<number>(1);
  const [formRecurring, setFormRecurring] = useState(false);
  const [scheduleFormLoading, setScheduleFormLoading] = useState(false);
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDateKey = useCallback((date: Date) => {
    return date.toLocaleDateString('en-CA');
  }, []);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    schedules.forEach((schedule) => {
      if (!schedule.date) return;
      const key = schedule.date.includes('T') ? schedule.date.split('T')[0] : schedule.date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(schedule);
    });
    return map;
  }, [schedules]);

  const getEnergyStatus = (daySchedules: Schedule[]) => {
    if (daySchedules.length === 0) {
      return null;
    }

    const totalGeneration = daySchedules.reduce((sum, schedule) => sum + (schedule.energy_generation || 0), 0);
    const totalConsumption = daySchedules.reduce((sum, schedule) => sum + (schedule.energy_consumption || 0), 0);

    if (totalGeneration <= 0 && totalConsumption <= 0) {
      return null;
    }

    if (totalGeneration >= totalConsumption) {
      return 'safe';
    }

    if (totalGeneration > 0) {
      return 'warning';
    }

    return 'insufficient';
  };

  useEffect(() => {
    const loadSchedules = async () => {
      if (!user && !userLoading) {
        try {
          await login();
        } catch (err) {
          console.error('Auto login failed:', err);
          setScheduleError('Failed to authenticate demo user.');
          setScheduleLoading(false);
        }
        return;
      }

      if (!user) {
        return;
      }

      setScheduleLoading(true);
      setScheduleError(null);

      try {
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        const startDateStr = formatDateKey(startDate);
        const endDateStr = formatDateKey(endDate);

        const data = await db.getSchedules(user.id, startDateStr, endDateStr);
        setSchedules(data);
      } catch (err) {
        console.error('Error loading schedules:', err);
        setScheduleError('Failed to load schedule data.');
        setSchedules([]);
      } finally {
        setScheduleLoading(false);
      }
    };

    if (userLoading) return;

    loadSchedules();
  }, [user, userLoading, login, currentMonth, currentYear, formatDateKey]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const resetScheduleForm = () => {
    setFormDeviceName('');
    setFormDeviceType('consumption_tool');
    setFormHoursUsed(1);
    setFormEnergyValue(1);
    setFormRecurring(false);
    setScheduleFormError(null);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDate(null);
    setScheduleFormError(null);
    setScheduleFormLoading(false);
    resetScheduleForm();
  };

  const handleDayClick = async (date: Date) => {
    if (!user && !userLoading) {
      try {
        await login();
      } catch (err) {
        console.error('Failed to login before scheduling:', err);
        setScheduleError('Please login before adding a schedule.');
      }
      return;
    }

    if (!user) {
      return;
    }

    setScheduleError(null);
    resetScheduleForm();
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setShowScheduleModal(true);
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square p-2 border border-gray-800/50 bg-gray-900/20"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const dateKey = formatDateKey(date);
      const daySchedules = schedulesByDate.get(dateKey) ?? [];
      const energyStatus = getEnergyStatus(daySchedules);
      const hasSchedule = daySchedules.length > 0;
      const uniqueDevices = hasSchedule
        ? new Set(daySchedules.map((schedule) => schedule.device_name || schedule.device_id || `${schedule.device_type}-${schedule.id}`)).size
        : 0;
      const generationCount = daySchedules.filter((schedule) => schedule.device_type === 'power_plant').length;
      const consumptionCount = daySchedules.filter((schedule) => schedule.device_type === 'consumption_tool').length;
      const deviceLabelCount = uniqueDevices || daySchedules.length;
      const isSelected = selectedDate ? formatDateKey(selectedDate) === dateKey : false;

      days.push(
        <div
          key={day}
          className={`aspect-square p-2 border border-gray-800/50 cursor-pointer transition-all duration-300 hover:border-emerald-500/50 hover:bg-gray-800/30 relative group ${
            isToday ? 'bg-emerald-500/5 border-emerald-500/30' : ''
          } ${isSelected ? 'border-emerald-400 bg-emerald-500/10' : ''}`}
          onClick={() => handleDayClick(date)}
          tabIndex={0}
          role="button"
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleDayClick(date);
            }
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-emerald-400' : 'text-gray-300'}`}>{day}</span>
              {energyStatus && (
                <div
                  className={`w-2 h-2 rounded-full ${
                    energyStatus === 'safe'
                      ? 'bg-emerald-500'
                      : energyStatus === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                ></div>
              )}
            </div>
            {hasSchedule && (
              <div className="mt-auto space-y-0.5">
                <div className="text-xs text-gray-400 truncate">
                  {deviceLabelCount} device{deviceLabelCount !== 1 ? 's' : ''}
                </div>
                {(generationCount > 0 || consumptionCount > 0) && (
                  <div className="text-[10px] text-gray-500">
                    {generationCount} gen / {consumptionCount} load
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
        </div>
      );
    }
    return days;
  };

  const handleScheduleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDate) {
      setScheduleFormError('No date selected.');
      return;
    }

    if (!user) {
      setScheduleFormError('Please login before adding a schedule.');
      return;
    }

    const trimmedName = formDeviceName.trim();
    if (!trimmedName) {
      setScheduleFormError('Device name is required.');
      return;
    }

    if (formHoursUsed <= 0) {
      setScheduleFormError('Hours used must be greater than zero.');
      return;
    }

    if (formEnergyValue < 0) {
      setScheduleFormError('Energy value must be zero or greater.');
      return;
    }

    setScheduleFormLoading(true);
    setScheduleFormError(null);

    try {
      const dateStr = formatDateKey(selectedDate);
      const deviceId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `device-${Math.random().toString(36).slice(2, 10)}`;

      const payload = {
        user_id: user.id,
        date: dateStr,
        device_id: deviceId,
        device_name: trimmedName,
        device_type: formDeviceType,
        hours_used: formHoursUsed,
        energy_consumption: formDeviceType === 'consumption_tool' ? formEnergyValue : 0,
        energy_generation: formDeviceType === 'power_plant' ? formEnergyValue : 0,
        is_recurring: formRecurring
      };

      const newSchedule = await db.createSchedule(payload);
      setSchedules((prev) => [...prev, newSchedule]);
      closeScheduleModal();
    } catch (err) {
      console.error('Failed to create schedule:', err);
      setScheduleFormError('Failed to save schedule. Please try again.');
    } finally {
      setScheduleFormLoading(false);
    }
  };

  const energyLabel = formDeviceType === 'power_plant' ? 'Energy generation (kWh)' : 'Energy consumption (kWh)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Zap className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ACEP</h1>
                  <p className="text-xs text-gray-500">Energy Planning</p>
                </div>
              </div>
            </div>
            <nav className="flex items-center space-x-3">
              <Link 
                href="/consumption"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                Consumption Tools
              </Link>
              <Link 
                href="/dashboard/powerplants"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              >
                Power Plants
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{mockData.totalPowerCapacity.toFixed(1)}<span className="text-base font-normal text-gray-400 ml-2">kW</span></h3>
              <p className="text-sm text-gray-400">Generation Capacity</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl flex items-center justify-center">
                  <Battery className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{mockData.storageUsage.toFixed(1)}<span className="text-base font-normal text-gray-400 ml-2">%</span></h3>
              <div className="w-full bg-gray-700/30 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${mockData.storageUsage}%` }}></div>
              </div>
              <p className="text-xs text-gray-400">{mockData.totalCurrentStorage.toFixed(1)} / {mockData.totalStorageCapacity.toFixed(1)} kWh</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{mockData.totalConsumptionCapacity.toFixed(1)}<span className="text-base font-normal text-gray-400 ml-2">kW</span></h3>
              <p className="text-sm text-gray-400">Consumption Capacity</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <div className="w-2 h-2 rounded-full mr-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                System Status
              </div>
              <p className="text-sm text-gray-400 mt-2">{mockData.statusText}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => navigateMonth('prev')} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-700/50 rounded-xl transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <h2 className="text-2xl font-bold text-white">{months[currentMonth]} {currentYear}</h2>
                    </div>
                    <button onClick={() => navigateMonth('next')} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-700/50 rounded-xl transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <button onClick={goToToday} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/20">
                    Today
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">{day}</div>
                  ))}
                </div>
                {scheduleError && (
                  <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                    {scheduleError}
                  </div>
                )}
                {scheduleLoading && !scheduleError && (
                  <div className="mb-3 text-sm text-gray-400 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Loading schedule data...</span>
                  </div>
                )}
                <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
                {!scheduleLoading && !scheduleError && schedules.length === 0 && (
                  <div className="mt-4 text-sm text-gray-400 text-center bg-gray-900/40 border border-gray-800 rounded-xl px-3 py-3">
                    No schedules found for this month. Create a schedule to see daily activity.
                  </div>
                )}
                <div className="mt-6 flex items-center justify-center space-x-6 text-sm pt-6 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                    <span className="text-gray-400">Safe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
                    <span className="text-gray-400">Warning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                    <span className="text-gray-400">Insufficient</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-lg flex items-center justify-center mr-3">
                  <Battery className="w-5 h-5 text-cyan-400" />
                </div>
                Storage Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                  <span className="text-sm text-gray-400">Total Capacity</span>
                  <span className="font-semibold text-white">{mockData.totalStorageCapacity.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                  <span className="text-sm text-gray-400">Current Level</span>
                  <span className="font-semibold text-cyan-400">{mockData.totalCurrentStorage.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Usage</span>
                  <span className="font-semibold text-white">{mockData.storageUsage.toFixed(1)}%</span>
                </div>
                <div className="relative pt-2">
                  <div className="w-full bg-gray-700/30 rounded-full h-3">
                    <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50" style={{ width: `${mockData.storageUsage}%` }}></div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">{mockData.storageUsage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm text-gray-300">Power Generation</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">Optimal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm text-gray-300">Storage System</span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-400">Good</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm text-gray-300">Consumption</span>
                  </div>
                  <span className="text-xs font-semibold text-purple-400">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <p className="text-sm text-gray-400">Add schedule for</p>
                <h3 className="text-xl font-semibold text-white">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeScheduleModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="px-6 py-6 space-y-6">
              {scheduleFormError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  {scheduleFormError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="deviceName">
                  Device name
                </label>
                <input
                  id="deviceName"
                  type="text"
                  value={formDeviceName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setFormDeviceName(event.target.value)}
                  placeholder="e.g. Solar Array A1"
                  className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={scheduleFormLoading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="deviceType">
                    Device type
                  </label>
                  <select
                    id="deviceType"
                    value={formDeviceType}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setFormDeviceType(event.target.value as 'consumption_tool' | 'power_plant')
                    }
                    className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={scheduleFormLoading}
                  >
                    <option value="consumption_tool">Consumption tool</option>
                    <option value="power_plant">Power plant</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="hoursUsed">
                    Hours used
                  </label>
                  <input
                    id="hoursUsed"
                    type="number"
                    min={0}
                    step={0.5}
                    value={formHoursUsed}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const value = Number(event.target.value);
                      setFormHoursUsed(Number.isNaN(value) ? 0 : value);
                    }}
                    className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={scheduleFormLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="energyValue">
                  {energyLabel}
                </label>
                <input
                  id="energyValue"
                  type="number"
                  min={0}
                  step={0.1}
                  value={formEnergyValue}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const value = Number(event.target.value);
                    setFormEnergyValue(Number.isNaN(value) ? 0 : value);
                  }}
                  className="w-full p-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={scheduleFormLoading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Specify the total energy {formDeviceType === 'power_plant' ? 'generated' : 'consumed'} for this entry.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isRecurring"
                  type="checkbox"
                  checked={formRecurring}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setFormRecurring(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                  disabled={scheduleFormLoading}
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-300">
                  Mark as recurring schedule
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={scheduleFormLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleFormLoading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  {scheduleFormLoading ? 'Saving...' : 'Save schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
