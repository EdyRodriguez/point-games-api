const express = require("express");
const gamesRoutes = require("./routes/games");
const usersRoutes = require("./routes/users");
const comprasRoutes = require("./routes/transactions");
const tokensRoutes = require("./routes/tokens");
const validacionApiKey = require("./middlewareApi");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use("/games", validacionApiKey, gamesRoutes);
app.use("/users", validacionApiKey,  usersRoutes);
app.use("/compras", validacionApiKey,  comprasRoutes);
app.use("/tokens", validacionApiKey,  tokensRoutes);
app.get("/", (req, res) => {
  res.send("Esta viva! 🥳");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
