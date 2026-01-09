import { Router, Request, Response, NextFunction } from "express";
import { commentControllers } from "./comment.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.post("/", auth(UserRole.USER, UserRole.ADMIN), commentControllers.createComment);
router.get('/:commentId', commentControllers.getCommentById);
router.get('/author/:authorId', commentControllers.getCommentByAuthor);
router.delete('/:commentId', auth(UserRole.ADMIN, UserRole.USER), commentControllers.deleteComment);
router.patch('/:commentId', auth(UserRole.ADMIN, UserRole.USER), commentControllers.updateComment);



export const commentRouter = router;