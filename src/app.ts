import express from "express"
import { postRouter } from "./module/post.router";
import {auth} from "./lib/auth"
import { toNodeHandler } from "better-auth/node";

const app = express();
// app.all('/api/auth/{*any}', toNodeHandler(auth));
app.all('/api/auth/*splat', toNodeHandler(auth));


app.use(express.json());

app.use("/posts", postRouter);

app.get("/", (req, res) => {
    res.send("Hello, World");
});



export default app;