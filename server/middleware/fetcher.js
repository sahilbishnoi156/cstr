const jwt = require("jsonwebtoken");

const fetchuser = (req, res, next) => {
  //~ get the user from the jwt token and add id to req object
  const token = req.header("authToken");
  if (!token) {
    res.status(401).json({ error: "Authentication token not found\n" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.body.creator = data.creator.id;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ error: "Authentication token error : " + error.message + "\n" });
  }
};
module.exports = fetchuser;
