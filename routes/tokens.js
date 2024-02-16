const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../firebaseConfig");
router.use(express.json());
const jwt = require("jsonwebtoken");
const passPhrase = process.env.TokensPassPhraseSecretKey;

function generarToken(cantidad) {
  const payload = {
    token: cantidad,
  };
  return jwt.sign(payload, passPhrase, { expiresIn: "30m" });
}

router.post("/generarToken", async (req, res) => {
  try {
    const { cantidad } = req.body;
    const token = generarToken({ cantidad, fecha: Date.now() });
    res.json(token);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/validarToken", async (req, res) => {
  const data = req.body;
  //comprobar si el token existe en transacciones pasadas
  //si existe, no se puede usar
  const tokenExist = await db.collection("transacciones").doc(data.token).get();

  if (tokenExist.exists) {
    res.status(401).json({ error: "Token invalid" });
  } else {
    try {
      jwt.verify(data.token, passPhrase, async (error, decoded) => {
        if (error) {
          res.status(401).json({ error: "Token invalid" });
        } else {
          const exist = await db.collection("usuarios").doc(data.usuario).get();
          if (exist.exists) {
            //agregar los tokens al usuario
            const actualTokens = exist.data().tokens;
            const newTokens = actualTokens + decoded.token.cantidad;
            await db
              .collection("usuarios")
              .doc(data.usuario)
              .update({ tokens: newTokens });
            await registrarToken(data, decoded, newTokens);
            res.json({ message: "Tokens agregados con exito" });
          } else {
            res.json({ message: "Que haces aqui Fred???" });
          }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
});

async function registrarToken(data, decoded, newTokens) {
  const batch = db.batch();
  const newTransaccionRef = db.collection("transacciones").doc(data.token);
  batch.set(newTransaccionRef, {
    usuario: data.usuario,
    tokens_restantes: newTokens,
    fecha: Date.now(),
    obtencion: true,
    descripcion: "Obtuvo: " + decoded.token.cantidad + " token nuevo",
  });
  await batch.commit();
}

module.exports = router;
