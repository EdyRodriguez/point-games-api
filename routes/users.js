const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../firebaseConfig");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const validacionMiddleware = require("../middlewareAuth");
const passPhrase = process.env.TokensPassPhraseSecretKey;
router.use(express.json());

router.post("/validate", async (req, res) => {
  const auth = req.body.auth;
  if (auth !== "") {
    const validationResponse = await twitchAuth(auth);
    const finalResponse = await getTwitchUser(validationResponse, auth);


    if (finalResponse.error) {
      res.status(finalResponse.status).json({ error: finalResponse.error });
    } else {
      //revisar si el usuario existe en la base de datos
      const userToken = jwt.sign(
        { userName: finalResponse.login },
        passPhrase,
        { expiresIn: "7d" }
      );
      const exist = await db
        .collection("usuarios")
        .doc(finalResponse.login)
        .get();
      if (exist.exists) {
        res.json({
          login: finalResponse.login,
          userToken: userToken,
          message: "User already exists",
          profileImage: finalResponse.profile_image_url,
        });
      } else {
        //si no existe, agregarlo
        const batch = db.batch();
        const newUserRef = db.collection("usuarios").doc(finalResponse.login);
        batch.set(newUserRef, {
          nombre: finalResponse.login,
          tokens: 0,
        });
        await batch.commit();
        res.json({
          login: finalResponse.login,
          userToken: userToken,
          message: "User added successfully",
          profileImage: finalResponse.profile_image_url,
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

router.get("/getUserGames", validacionMiddleware, async (req, res) => {
  const usuario = req.query.usuario;
  if (usuario !== "") {
    const juegosCanjeados = await db
      .collection("juegos")
      .where("usuario", "==", usuario)
      .get();
      console.log(juegosCanjeados);
    if (juegosCanjeados.docs.length > 0) {
      const juegos = juegosCanjeados.docs.map((doc) => {
        const data = doc.data();
        return data;
      });
      res.json(juegos);
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
      return data; // Retornamos el login como parte de un objeto
    }
  } catch (error) {
    return { error: "Internal Server Error", status: 500 };
  }
}

async function getTwitchUser(userData, auth) {
  try {
    const response = await fetch(`https://api.twitch.tv/helix/users?id=${userData.user_id}`, {
      method: "GET",
      headers: {
        "Client-Id": userData.client_id,
        Authorization: `Bearer ${auth}`,
      },
    });
    const data = await response.json();
    return data.data[0];
  }
  catch (error) {
    return { error: "Internal Server Error", status: 500 };
  }
}

module.exports = router;
