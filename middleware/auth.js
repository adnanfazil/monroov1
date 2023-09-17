const jwt = require("jsonwebtoken");

const config = process.env;

const   verifyToken = (req, res, next) => {
  console.log(req.cookies);
  var token = req.headers["x-access-token"];
  if (!token) {
    token = req.cookies.access_token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, config.JWT_KEY);
      req.user = data;
      // Almost done
    } catch {
      return res.status(403).send("A token is required for authentication");
    }
    return next();
  }
  try {
    const decoded = jwt.verify(token, config.JWT_KEY);
    req.user = decoded;
  } catch (err) {
      console.log(err)
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;