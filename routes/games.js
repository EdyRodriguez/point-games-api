const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("../firebaseConfig");

router.get("/getGames", async (req, res) => {
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

router.use(bodyParser.json());

router.post("/importGames", async (req, res) => {
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

module.exports = router;
