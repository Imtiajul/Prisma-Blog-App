import { Router, Request, Response, NextFunction } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get("/", postController.getAllPost);

router.post("/", auth(UserRole.USER), postController.createPost);



export const postRouter = router;