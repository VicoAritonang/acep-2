'use client'

import { type ConsumptionTool } from '@/lib/supabaseClient'

interface ToolCardProps {
  tool: ConsumptionTool
  onEdit: (tool: ConsumptionTool) => void
  onDelete: (toolId: string) => void
}

export default function ToolCard({ tool, onEdit, onDelete }: ToolCardProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-lg p-6 hover:scale-[1.02] hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-500/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {tool.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{tool.kw_per_hour} kW/h</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(tool)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition-all duration-300"
            title="Edit tool"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(tool.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300"
            title="Delete tool"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
