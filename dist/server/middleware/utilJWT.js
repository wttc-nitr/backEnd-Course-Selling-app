"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.createToken = void 0;
// const jwt = require("jsonwebtoken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = "random-bullshit-go";
const createToken = (username, role) => {
    const token = jsonwebtoken_1.default.sign({
        username,
        role,
    }, secret, { expiresIn: "1h" });
    return token;
};
exports.createToken = createToken;
const decodeToken = (token) => {
    let data;
    jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
        if (err || !decoded || typeof decoded === "string") {
            console.log('error in decodeToken function');
        }
        else
            data = decoded.username;
    });
    return data;
};
exports.decodeToken = decodeToken;
// module.exports = { createToken, decodeToken };
