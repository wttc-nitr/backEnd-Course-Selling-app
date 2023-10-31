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
    const list = yield db_1.Admin.find({});
    res.json(list);
}));
router.get("/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { username }: { username: string } = req.headers.decoded!;
    res.json({ username: req.headers.username });
}));
const signUpProps = zod_1.z.object({
    username: zod_1.z.string().min(1).max(254),
    password: zod_1.z.string().min(1).max(256)
});
// Admin routes
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = signUpProps.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(411).json({ msg: parsedInput.error });
    }
    const { username, password } = parsedInput.data;
    // console.log(username, password);
    // Admin.findOne({username: username})
    const admin = yield db_1.Admin.findOne({ username });
    if (admin) {
        res.status(400).send("user already exists, try another username !");
        return;
    }
    // new Admin({username: username, password: password})
    const newAdmin = new db_1.Admin({ username, password });
    yield newAdmin.save();
    const token = (0, utilJWT_1.createToken)(username, "admin");
    res.json({ message: "Admin created successfully", token: token });
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
    // Admin.findOne({username: username, password: password})
    let found = yield db_1.Admin.findOne({ username, password });
    if (!found || typeof username !== "string" || typeof password !== "string")
        return res.status(400).send({ message: "username or password not found" });
    const token = (0, utilJWT_1.createToken)(username, "admin");
    res.json({ message: "Logged in successfully", token: token });
}));
const courseProps = zod_1.z.object({
    title: zod_1.z.string().min(1).max(280),
    description: zod_1.z.string(),
    price: zod_1.z.number().min(0).max(20000),
    imageLink: zod_1.z.string().min(3),
    published: zod_1.z.boolean()
});
router.post("/courses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = courseProps.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(411).json({ msg: parsedInput.error });
    }
    const { title, description, price, imageLink, published } = parsedInput.data;
    const course = {
        title: title,
        description: description,
        price: price,
        imageLink: imageLink,
        published: published,
    };
    // const newCourse = new Course(req.body); mongoose will take care of any errors
    const newCourse = new db_1.Course(course);
    yield newCourse.save();
    res.json({ message: "Course created successfully", courseId: newCourse.id });
}));
router.put("/courses/:courseId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
     *
     * if (course) {
     *  res.send('course updated successfully');
     * else res.status(400).send('no such course');
     *
     */
    // const course = await Course.findOne({ _id: req.params.courseId });
    const course = yield db_1.Course.findById(req.params.courseId);
    if (!course) {
        res.status(400).send("no such courseId");
        return;
    }
    const { title, description, price, imageLink, published } = req.body;
    course.title = title;
    course.description = description;
    course.price = price;
    course.imageLink = imageLink;
    course.published = published;
    yield course.save();
    res.json({ message: "Course updated successfully" });
}));
router.get("/courses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield db_1.Course.find({});
    res.json({ courses: courses });
}));
// module.exports = router;
exports.default = router;
