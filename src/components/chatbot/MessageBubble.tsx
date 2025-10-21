'use client'

interface MessageBubbleProps {
  message: string
  isUser: boolean
  timestamp?: Date
}

export default function MessageBubble({ message, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-green-500 text-black rounded-br-sm' 
          : 'bg-gray-100 text-black rounded-bl-sm'
      }`}>
        <p className="text-sm text-black">{message}</p>
        {timestamp && (
          <p className="text-xs mt-1 text-black">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
