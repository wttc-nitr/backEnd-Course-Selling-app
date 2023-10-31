import express from "express"
import { User, Course } from "../db/db"
import authenticate from "../middleware/auth"
import { createToken } from "../middleware/utilJWT"
import { z } from "zod"

const router = express.Router();

router.get("/list", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

router.get("/me", authenticate, async (req, res) => {
  res.json({ username: req.headers.username });
});

const signUpProps = z.object({
  username: z.string().min(1).max(254),
  password: z.string().min(1).max(256)
})

// User routes
router.post("/signup", async (req, res) => {
  const parsedInput = signUpProps.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(411).json({msg: parsedInput.error});
  }
  const { username, password } = parsedInput.data;

  let found = await User.findOne({ username });

  if (found)
    res.status(403).send("username already exists, try another username");
  else {
    // new User({username: username, password: password})
    const newUser = new User({ username, password });

    await newUser.save();

    const token = createToken(username, "user");

    res.json({ message: "User created successfully", token: token });
  }
});

const loginProps = z.object({
  username: z.string().min(1).max(254),
  password: z.string().min(1).max(256)
})

router.post("/login", async (req, res) => {
  const { username, password } = req.headers;
  const parsedInput = loginProps.safeParse({username, password});
  if (!parsedInput.success) {
    return res.status(411).json({msg: parsedInput.error});
  }
  if (!username || username instanceof Array || !password || password instanceof Array)
    return res.status(400).send({ message: 'username or password is not string'});

  let found = await User.findOne({ username, password });

  if (!found)
    return res.status(400).send({ message: "username or password not found" });

  const token = createToken(username, "user");
  res.json({ message: "Logged in successfully", token: token });
});

router.get("/courses", authenticate, async (req, res) => {
  const courses = await Course.find({ published: true });
  res.json({ courses: courses });
});

router.post("/courses/:courseId", authenticate, async (req, res) => {
  // const course = await Course.findOne({ _id: req.params.courseId });
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    res.status(400).send("no such course");
    return;
  }

  const { username } = req.headers;

  // User.findOne({username: username})
  const user = await User.findOne({ username });

  if (!user) {
    res.status(400).send(`can't find user`);
    return;
  }

  let alreadyPurchased = user.purchasedCourses.filter(
    (id) => id.toString() === req.params.courseId
  );

  if (alreadyPurchased && alreadyPurchased.length >= 1) {
    res.json({ message: "Course already purchased" });
    return;
  }

  user.purchasedCourses.push(course._id);

  await user.save();

  res.json({ message: "Course purchased successfully" });
});

router.get("/purchasedCourses", authenticate, async (req, res) => {
  // const data = req.decoded;
  const { username } = req.headers;

  // User.findOne({username: username})
  const user = await User.findOne({ username }).populate("purchasedCourses");

  if (!user) {
    res.status(403).send("no such user");
    return;
  }

  res.send({ purchasedCourses: user.purchasedCourses || [] });
});

// module.exports = router;
export default router;
