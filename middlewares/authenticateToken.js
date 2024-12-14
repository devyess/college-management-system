const jwt=require("jsonwebtoken");

//this will be a middlewareS to authenticate the students and professors
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing or invalid" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  };
  module.exports=authenticateToken;