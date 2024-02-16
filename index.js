const express = require("express");
const gamesRoutes = require("./routes/games");
const usersRoutes = require("./routes/users");
const comprasRoutes = require("./routes/compras");
const tokensRoutes = require("./routes/tokens");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use("/games", gamesRoutes);
app.use("/users", usersRoutes);
app.use("/compras", comprasRoutes);
app.use("/tokens", tokensRoutes);
app.get("/", (req, res) => {
  res.send("Esta viva! 🥳");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
