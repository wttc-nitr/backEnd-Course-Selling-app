"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const { decodeToken } = require("./utilJWT");
const utilJWT_1 = require("./utilJWT");
const authJWT = (req, res, next) => {
    const { authorization } = req.headers;
    // console.log(req.headers);
    if (authorization === null || authorization === void 0 ? void 0 : authorization.startsWith("Bearer ")) {
        const token = authorization.substring(7);
        const data = (0, utilJWT_1.decodeToken)(token);
        if (data)
            req.headers["username"] = data;
        if (!data) {
            res.status(400).send("error in decoding, try to login again");
        }
        else
            next();
    }
    else
        res.status(400).send("login failed in authorize function");
};
exports.default = authJWT;
