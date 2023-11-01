"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const admin_1 = __importDefault(require("./server/routes/admin"));
const user_1 = __importDefault(require("./server/routes/user"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/admin", admin_1.default);
app.use("/user", user_1.default);
mongoose_1.default.connect(`${process.env.MONGO_URL}`);
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
