import express from "express";
import { Admin, Course } from "../db/db"
import authenticate from "../middleware/auth";
import { createToken } from "../middleware/utilJWT";
import { z } from "zod";

const router = express.Router();

router.get("/list", async (req, res) => {
  const list = await Admin.find({});
  res.json(list);
});

router.get("/me", authenticate, async (req, res) => {
  // const { username }: { username: string } = req.headers.decoded!;
  res.json({ username: req.headers.username });
});

const signUpProps = z.object({
  username: z.string().min(1).max(254),
  password: z.string().min(1).max(256)
})

type SignupParams = z.infer<typeof signUpProps>;

// Admin routes
router.post("/signup", async (req, res) => {
  const parsedInput = signUpProps.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(411).json({msg: parsedInput.error })
  }
  const { username, password } = parsedInput.data;
  // console.log(username, password);
  // Admin.findOne({username: username})
  const admin = await Admin.findOne({ username });

  if (admin) {
    res.status(400).send("user already exists, try another username !");
    return;
  }

  // new Admin({username: username, password: password})
  const newAdmin = new Admin({ username, password });
  await newAdmin.save();

  const token = createToken(username, "admin");

  res.json({ message: "Admin created successfully", token: token });
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

  // Admin.findOne({username: username, password: password})
  let found = await Admin.findOne({ username, password });

  if (!found || typeof username !== "string" || typeof password !== "string")
    return res.status(400).send({ message: "username or password not found" });

  const token = createToken(username, "admin");

  res.json({ message: "Logged in successfully", token: token });
});

const courseProps = z.object({
  title: z.string().min(1).max(280),
  description: z.string(),
  price: z.number().min(0).max(20_000),
  imageLink: z.string().min(3),
  published: z.boolean()
})

router.post("/courses", authenticate, async (req, res) => {
  const parsedInput = courseProps.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(411).json({msg: parsedInput.error});
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
  const newCourse = new Course(course);
  await newCourse.save();

  res.json({ message: "Course created successfully", courseId: newCourse.id });
});

router.put("/courses/:courseId", authenticate, async (req, res) => {
  /**
   * const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
   *
   * if (course) {
   *  res.send('course updated successfully');
   * else res.status(400).send('no such course');
   *
   */
  // const course = await Course.findOne({ _id: req.params.courseId });
  const course = await Course.findById(req.params.courseId);

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

  await course.save();

  res.json({ message: "Course updated successfully" });
});

router.get("/courses", authenticate, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses: courses });
});

// module.exports = router;
export default router;
