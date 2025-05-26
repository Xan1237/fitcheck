// signUpUser.js
import { supabase } from '../config/supabaseApp.js'

export const signUpUser = async (req, res) => {
  const { email, password } = req.body

  // 1) Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Email and password are required' })
  }

  try {
    console.log(`Attempting to create user with email: ${email}`)

    // 2) Call Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Signup error:', error)
      // Use error.status if available, otherwise default to 400
      const status = error.status || 400
      return res
        .status(status)
        .json({ success: false, message: error.message })
    }

    // 3) On success, Supabase will send a confirmation email
    console.log('User created (pending email confirmation):', data.user)

    

    return res.status(201).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        // note: `data.session` is null until they confirm their email
      },
    })
  } catch (err) {
    console.error('Unexpected signup error:', err)
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' })
  }
}
