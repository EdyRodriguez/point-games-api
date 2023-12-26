const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
require("dotenv").config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://twitch-point-games.firebaseio.com",
});

const app = express();
const db = admin.firestore();

app.get('/', (req, res) => {
    res.send('Esta viva! 🥳')
  })

app.get("/getGames", async (req, res) => {
  try {
    const keysSnapshot = await db.collection("juegos").get();
    const keys = keysSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Exclude the "key" field from the response
      const { key, ...rest } = data;
      return rest;
    });
    res.json(keys);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post("/importGames", async (req, res) => {
  try {
    const games = req.body;

    if (!Array.isArray(games)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const gamesData = games.map((gameName) => ({
      canjeado: false,
      key: "",
      nombre: gameName,
      usuario: "",
    }));

    const batch = db.batch();
    gamesData.forEach((game) => {
      const newGameRef = db.collection("juegos").doc(game.nombre);
      batch.set(newGameRef, game);
    });

    await batch.commit();

    res.json({ success: true, message: "Games imported successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
