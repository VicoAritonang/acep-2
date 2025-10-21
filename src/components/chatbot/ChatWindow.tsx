'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { useUser } from '@/contexts/UserContext'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya ACEP AI Assistant. Bagaimana saya bisa membantu perencanaan energi Anda hari ini?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Generate session ID if not exists
      // Generate a proper UUID v4 format
      const sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chat: messageToSend,
          sessionId: sessionId,
          userId: user?.id || 'demo-user-id',
          full_name: user?.full_name || 'ACEP Demo Account'
        }),
        // Add timeout to wait for response
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Chat response data:', data)
        console.log('Response field:', data.response)
        console.log('Message field:', data.message)
        
        // Handle response format - API already processes the response
        let aiResponse = ''
        
        // The API already extracts and cleans the response, so we just need to get it
        if (data.response) {
          aiResponse = data.response
        } else if (data.message) {
          aiResponse = data.message
        } else if (Array.isArray(data) && data.length > 0) {
          // Fallback: handle array format directly
          const responseText = data[0].output || data[0].response || ''
          aiResponse = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
        } else if (data.result?.response) {
          aiResponse = data.result.response
        } else if (data.result?.output) {
          aiResponse = data.result.output
        } else {
          console.log('No valid response found in data:', data)
          aiResponse = 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'
        }
        
        // Additional cleanup if needed
        if (aiResponse) {
          aiResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
        }
        
        console.log('Final aiResponse:', aiResponse)
        
        // Only add message if we have a valid response
        if (aiResponse && aiResponse !== 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.') {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            isUser: false,
            timestamp: new Date()
          }

          setMessages(prev => [...prev, aiMessage])
        } else {
          // Show error message if no valid response
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi.',
            isUser: false,
            timestamp: new Date()
          }

          setMessages(prev => [...prev, errorMessage])
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Maaf, terjadi kesalahan dalam memproses permintaan Anda. Silakan coba lagi.',
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-green-500 text-black p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-300 rounded-full"></div>
          <span className="font-medium">ACEP AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-black px-4 py-2 rounded-lg rounded-bl-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-black">ACEP is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tulis pesan Anda..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-black placeholder:text-black/60"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
