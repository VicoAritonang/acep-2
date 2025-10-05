import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  try {
    // Get demo user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@acep.app')
      .single()

    // If demo user doesn't exist, create it
    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'demo@acep.app',
          full_name: 'ACEP Demo Account',
          role: 'demo',
          latitude: -1.256,
          longitude: 116.822
        })
        .select()
        .single()

      if (createError || !newUser) {
        return NextResponse.json(
          { error: 'Failed to create demo user' },
          { status: 500 }
        )
      }

      // Use the newly created user
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role
        }
      })
    }

    // Return demo user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: 'Failed to login demo user' },
      { status: 500 }
    )
  }
}
