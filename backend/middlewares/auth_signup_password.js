// signUpUser.js
import { supabase } from '../config/supabaseApp.js'

export const signUpUser = async (req, res) => {
  const { email, password, username } = req.body

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
      options: {
        data: {
          username: username || email.split('@')[0] // Set default username if not provided
        }
      }
    })

    if (error) {
      console.error('Signup error:', error)
      // Use error.status if available, otherwise default to 400
      const status = error.status || 400
      return res
        .status(status)
        .json({ success: false, message: error.message })
    }

    // 3) Create user profile in database
    if (data.user) {
      const defaultUsername = username || email.split('@')[0];
      
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          username: username,
          updated_at: new Date()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the signup - just log the error
      }

      // Create public profile
      const { error: publicProfileError } = await supabase
        .from('public_profiles')
        .upsert({
          username: username,
        });

      if (publicProfileError) {
        console.error('Public profile creation error:', publicProfileError);
      }
    }

    // 4) On success, Supabase will send a confirmation email
    console.log('User created (pending email confirmation):', data.user)

    return res.status(201).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: username || email.split('@')[0],
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