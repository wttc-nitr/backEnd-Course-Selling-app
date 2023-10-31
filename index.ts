import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import adminRouter from "./server/routes/admin" 
import userRouter from "./server/routes/user"

const app = express();

app.use(express.json());
app.use(cors());
app.use("/admin", adminRouter);
app.use("/user", userRouter);

mongoose.connect(
  ""
);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
