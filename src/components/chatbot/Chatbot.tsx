'use client'

import { useState } from 'react'
import ChatbotButton from './ChatbotButton'
import ChatWindow from './ChatWindow'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <ChatbotButton onClick={toggleChat} isOpen={isOpen} />
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
