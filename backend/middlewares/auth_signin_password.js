import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from './FireBaseApp.js'
const auth = getAuth(app);

const signInUser = (req, res) => {
  const { email, password } = req.body
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // Get the user's ID token
      return user.getIdToken()
        .then(token => {
          res.status(201).json({ 
            success: true, 
            uid: user.uid, 
            email: user.email,
            token: token 
          });
        });
    })
    .catch((error) => {
      res.status(400).json({ success: false, message: error.message });
    });
}

export { signInUser }