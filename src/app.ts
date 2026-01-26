import express from "express"
import { postRouter } from "./module/posts/post.router";
import {auth} from "./lib/auth"
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { commentRouter } from "./module/comments/comment.router";
import errorHandler from "./middleware/globalErrorHander";
import notFound from "./middleware/notFound";

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true // to access cookies data
}))

// app.all('/api/auth/{*any}', toNodeHandler(auth));
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.get("/", (req, res) => {
    res.send("Hello, World");
});

app.use(notFound);
app.use(errorHandler);


export default app;