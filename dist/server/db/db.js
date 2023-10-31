"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = exports.Admin = exports.User = void 0;
// const mongoose = require("mongoose");
const mongoose_1 = __importDefault(require("mongoose"));
//Mongoose schema
const adminSchema = new mongoose_1.default.Schema({
    username: String,
    password: String,
});
const userSchema = new mongoose_1.default.Schema({
    username: String,
    password: String,
    purchasedCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" }],
});
const courseSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    price: Number,
    imageLink: String,
    published: Boolean,
});
//Mongoose Model
exports.User = mongoose_1.default.model("User", userSchema);
exports.Admin = mongoose_1.default.model("Admin", adminSchema);
exports.Course = mongoose_1.default.model("Course", courseSchema);
// module.exports = {
//   User,
//   Admin,
//   Course,
// };
