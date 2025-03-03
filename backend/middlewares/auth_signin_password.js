import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {app} from './FireBaseApp.js'
const auth = getAuth(app);

const signInUser = (req, res) =>{
    const {email, password} = req.body

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    res.status(201).json({ success: true, uid: user.uid, email: user.email });
    })
   .catch((error) => {
    res.status(400).json({ success: false, message: error.message });
  });
}

export {signInUser}


