import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { chat, sessionId, userId, full_name } = await request.json()

    if (!chat || !sessionId || !userId || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: chat, sessionId, userId, full_name' },
        { status: 400 }
      )
    }

    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      // For now, just log the message and return success
      console.log('Chat message received:', { chat, sessionId, userId, full_name })
      return NextResponse.json(
        { 
          success: true, 
          message: 'Message received (n8n webhook not configured yet)',
          response: `Terima kasih atas pesan Anda: "${chat}". Saya adalah asisten ACEP yang siap membantu Anda dengan pertanyaan tentang energi dan perencanaan.`,
          receivedMessage: chat 
        }
      )
    }

    // Send message to n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat,
        sessionId,
        userId,
        full_name
      }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`)
    }

    const result = await response.json()
    console.log('n8n response:', result)

    // Extract response from n8n format
    let extractedResponse = ''
    if (Array.isArray(result) && result.length > 0) {
      // Handle array format: [{"output":"response text"}]
      extractedResponse = result[0].output || ''
    } else if (result.response) {
      extractedResponse = result.response
    } else if (result.output) {
      extractedResponse = result.output
    } else if (result.message) {
      extractedResponse = result.message
    } else {
      extractedResponse = 'No response from assistant'
    }

    // Clean up the response
    if (extractedResponse) {
      extractedResponse = extractedResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    }

    // Save chat history to database
    try {
      await db.saveChatHistory({
        session_id: sessionId,
        user_id: userId,
        full_name,
        chat,
        output: extractedResponse
      })
    } catch (dbError) {
      console.error('Failed to save chat history:', dbError)
      // Continue even if database save fails
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent to ACEP Assistant',
      response: extractedResponse,
      result
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
