const jwt = require("jsonwebtoken");

const validacionApiKey = (req, res, next) => {
  const apiKey = req.headers.apikey;
  if (apiKey !== process.env.API_SECRET_KEY) {
    res.status(401).json({ error: "ApiKey invalid" });
  }else{
  next();
    }
};

module.exports =  validacionApiKey;