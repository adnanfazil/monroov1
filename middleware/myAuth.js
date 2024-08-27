const verifyHeader = (req, res, next) => {
  console.log(req.cookies);
  var token = req.headers["x-secret"];
  if (!token) {
    return res.status(401).send("Invalid Token");
  }
  try {
     if(token === 'MonrooHeaders'){
        next();
     }else{
        return res.status(401).send("Invalid Token");
     }
  } catch (err) {
      console.log(err)
    return res.status(401).send("Invalid Token");
  }
};

module.exports = verifyHeader;