const { verify } = require("jsonwebtoken");
const key = require("config").get("JwtKey");

const authM = async (req, res, next) => {
  // Token rausnehmen
  const token = req.header("x-auth-token");

  // Token existiert ?
  if (!token) {
    return res.status(404).json({
      msg: "Access Denied,you're not allowed to access this Route !!!",
    });
  }

  try {
    // Token Überprüfen und den User decodieren
    verify(token, key, (errors, decode) => {
      if (errors) {
        // Überprüfe ob irgendwelche errors vorliget
        return res.status(404).json({ msg: "Token is invalid" });
      } else {
        // Kein error ? user hat den Zugriff
        req.user = decode.user;
        next();
      }
    });
  } catch (error) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = authM;
