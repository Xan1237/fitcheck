import admin from "firebase-admin";

admin.initializeApp();

app.post("/secure-endpoint", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Authenticated user:", decodedToken.uid);
    res.json({ success: true, userId: decodedToken.uid });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
});
