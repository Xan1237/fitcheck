// signInUser.js
import { supabase } from './supabaseApp.js'

export const signInUser = async (req, res) => {
  const { email, password } = req.body

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Email and password are required' })
  }

  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Supabase errors often include a status code
      const status = error.status || 400
      return res
        .status(status)
        .json({ success: false, message: error.message })
    }

    // On success, data.session contains tokens
    const { user, session } = data
    console.log(`User signed in: ${user.id}`)

    return res.status(200).json({
      success: true,
      uid: user.id,
      email: user.email,
      token: session.access_token,   // JWT for client to use
      expires_at: session.expires_at  // timestamp when it expires
    })
  } catch (err) {
    console.error('Unexpected sign-in error:', err)
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' })
  }
}
