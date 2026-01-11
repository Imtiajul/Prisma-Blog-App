import { Router, Request, Response, NextFunction } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get("/stats", postController.getStates);

router.get("/", postController.getAllPost);
router.get("/:postId", postController.getPostById);
router.get("/author/my-posts", auth(UserRole.ADMIN, UserRole.USER), postController.getMyPosts);

router.post("/", auth(UserRole.USER, UserRole.ADMIN), postController.createPost);

router.patch("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.updatePost);

router.delete("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.deletePost);


export const postRouter = router;