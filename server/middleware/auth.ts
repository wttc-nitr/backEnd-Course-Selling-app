// const { decodeToken } = require("./utilJWT");
import { decodeToken } from "./utilJWT"
import { NextFunction, Request, Response } from "express";

const authJWT = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  // console.log(req.headers);

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.substring(7);

    const data = decodeToken(token);

    if (data) req.headers["username"] = data;

    if (!data) {
      res.status(400).send("error in decoding, try to login again");
    } else next();
  } else res.status(400).send("login failed in authorize function");
};

export default authJWT;
