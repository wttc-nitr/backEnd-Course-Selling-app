"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db/db");
const auth_1 = __importDefault(require("../middleware/auth"));
const utilJWT_1 = require("../middleware/utilJWT");
const zod_1 = require("zod");
const router = express_1.default.Router();
router.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db_1.User.find({});
    res.send(users);
}));
router.get("/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ username: req.headers.username });
}));
const signUpProps = zod_1.z.object({
    username: zod_1.z.string().min(1).max(254),
    password: zod_1.z.string().min(1).max(256)
});
// User routes
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = signUpProps.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(411).json({ msg: parsedInput.error });
    }
    const { username, password } = parsedInput.data;
    let found = yield db_1.User.findOne({ username });
    if (found)
        res.status(403).send("username already exists, try another username");
    else {
        // new User({username: username, password: password})
        const newUser = new db_1.User({ username, password });
        yield newUser.save();
        const token = (0, utilJWT_1.createToken)(username, "user");
        res.json({ message: "User created successfully", token: token });
    }
}));
const loginProps = zod_1.z.object({
    username: zod_1.z.string().min(1).max(254),
    password: zod_1.z.string().min(1).max(256)
});
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const parsedInput = loginProps.safeParse({ username, password });
    if (!parsedInput.success) {
        return res.status(411).json({ msg: parsedInput.error });
    }
    if (!username || username instanceof Array || !password || password instanceof Array)
        return res.status(400).send({ message: 'username or password is not string' });
    let found = yield db_1.User.findOne({ username, password });
    if (!found)
        return res.status(400).send({ message: "username or password not found" });
    const token = (0, utilJWT_1.createToken)(username, "user");
    res.json({ message: "Logged in successfully", token: token });
}));
router.get("/courses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield db_1.Course.find({ published: true });
    res.json({ courses: courses });
}));
router.post("/courses/:courseId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const course = await Course.findOne({ _id: req.params.courseId });
    const course = yield db_1.Course.findById(req.params.courseId);
    if (!course) {
        res.status(400).send("no such course");
        return;
    }
    const { username } = req.headers;
    // User.findOne({username: username})
    const user = yield db_1.User.findOne({ username });
    if (!user) {
        res.status(400).send(`can't find user`);
        return;
    }
    let alreadyPurchased = user.purchasedCourses.filter((id) => id.toString() === req.params.courseId);
    if (alreadyPurchased && alreadyPurchased.length >= 1) {
        res.json({ message: "Course already purchased" });
        return;
    }
    user.purchasedCourses.push(course._id);
    yield user.save();
    res.json({ message: "Course purchased successfully" });
}));
router.get("/purchasedCourses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const data = req.decoded;
    const { username } = req.headers;
    // User.findOne({username: username})
    const user = yield db_1.User.findOne({ username }).populate("purchasedCourses");
    if (!user) {
        res.status(403).send("no such user");
        return;
    }
    res.send({ purchasedCourses: user.purchasedCourses || [] });
}));
// module.exports = router;
exports.default = router;
