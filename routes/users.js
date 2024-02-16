const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../firebaseConfig");
const fetch = require("node-fetch");

router.use(express.json());

router.post("/validate", async (req, res) => {
  const auth = req.body.auth;
  if (auth !== "") {
    const finalResponse = await twitchAuth(auth);

    if (finalResponse.error) {
      res.status(finalResponse.status).json({ error: finalResponse.error });
    } else {
      //revisar si el usuario existe en la base de datos
      const exist = await db
        .collection("usuarios")
        .doc(finalResponse.login)
        .get();
      if (exist.exists) {
        res.json({
          login: finalResponse.login,
          message: "User already exists",
        });
      } else {
        //si no existe, agregarlo
        const batch = db.batch();
        const newUserRef = db.collection("usuarios").doc(finalResponse.login);
        batch.set(newUserRef, { nombre: finalResponse.login, tokens: 0 });
        await batch.commit();
        res.json({
          login: finalResponse.login,
          message: "User added successfully",
        });
      }
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.get("/getUserTokens", async (req, res) => {
  const name = req.query.name;
  if (name !== "") {
    const user = await db.collection("usuarios").doc(name).get();
    if (user.exists) {
      res.json({ tokens: user.data().tokens });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

async function twitchAuth(auth) {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/validate", {
      method: "GET",
      headers: {
        Authorization: `OAuth ${auth}`,
      },
    });
    const data = await response.json();

    if (data.status === 401) {
      return { error: "Unauthorized", status: 401 };
    } else {
      return { login: data.login }; // Retornamos el login como parte de un objeto
    }
  } catch (error) {
    return { error: "Internal Server Error", status: 500 };
  }
}

module.exports = router;
