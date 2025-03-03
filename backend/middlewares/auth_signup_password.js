import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {app} from './FireBaseApp.js'
const auth = getAuth(app);

const signUpUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      res.status(200).json({ success: true, uid: user.uid, email: user.email });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  };

export {signUpUser}