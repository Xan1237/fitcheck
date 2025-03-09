import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from './FireBaseApp.js'
const auth = getAuth(app);

const signUpUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Email and password are required" 
    });
  }
  
  try {
    console.log(`Attempting to create user with email: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`User created successfully: ${user.uid}`);
    
    // Get the user's ID token
    const token = await user.getIdToken();
    
    return user.getIdToken()
    .then(token => {
      res.status(201).json({ 
        success: true, 
        uid: user.uid, 
        email: user.email,
        token: token 
      });
    });
  } catch (error) {
    console.error(`Signup error: ${error.code} - ${error.message}`);
    
    // Map Firebase error codes to appropriate HTTP status codes
    let statusCode = 400; // Default to bad request
    let message = error.message;
    
    switch(error.code) {
      case 'auth/email-already-in-use':
        statusCode = 409; // Conflict
        message = "Email already in use";
        break;
      case 'auth/invalid-email':
        statusCode = 400; // Bad request
        message = "Invalid email format";
        break;
      case 'auth/weak-password':
        statusCode = 400; // Bad request
        message = "Password is too weak";
        break;
      case 'auth/network-request-failed':
        statusCode = 503; // Service unavailable
        message = "Network error, please try again";
        break;
      case 'auth/operation-not-allowed':
        statusCode = 403; // Forbidden
        message = "Email/password accounts are not enabled";
        break;
      default:
        statusCode = 500; // Internal server error
        break;
    }
    
    return res.status(statusCode).json({ 
      success: false, 
      code: error.code,
      message: message
    });
  }
};

export { signUpUser }