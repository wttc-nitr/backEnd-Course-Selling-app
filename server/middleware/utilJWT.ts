// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken"
const secret = "random-bullshit-go";

export const createToken = (username: string, role: "admin" | "user") => {
  const token = jwt.sign(
    {
      username,
      role,
    },
    secret,
    { expiresIn: "1h" }
  );

  return token;
};

export const decodeToken = (token: string) => {
  let data: undefined | string;

  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded || typeof decoded === "string") {
      console.log('error in decodeToken function');
    } else data = decoded.username;
  });

  return data;
};

// module.exports = { createToken, decodeToken };
