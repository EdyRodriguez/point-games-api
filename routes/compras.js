const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../firebaseConfig");
router.use(express.json());

/*
Aqui pondremos los datos de los tokens que se han intercambiado, quien los intercambio
si fue gasto o si fue ganado, y el juego que se intercambio
Ejemplo de esquema para una transacción de token:
id: Identificador único de la transacción. (este es automatico)
usuario: Identificador del usuario asociado a la transacción.
tokens_restantes: Cantidad de tokens obtenidos o gastados en la transacción.
tipo: Tipo de transacción (por ejemplo, "obtención", "gasto").
fecha: Fecha y hora de la transacción. (timestamp)
descripcion: Descripción opcional de la transacción. (por ejemplo si fue un juego sera:  'Elden Ring')
*/

router.get("/getTransacciones", async (req, res) => {
  try {
    const transaccionesSnapshot = await db.collection("transacciones").get();
    const transacciones = transaccionesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return data;
    });
    res.json(transacciones);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
