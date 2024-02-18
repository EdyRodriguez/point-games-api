const jwt = require("jsonwebtoken");
const passPhrase = process.env.TokensPassPhraseSecretKey;


const validacionMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "Token invalid" });
  }
  jwt.verify(token, passPhrase, (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Token invalid" });
    } else {
      next();
    }
  });
};

module.exports = validacionMiddleware;