import { Request, Response } from "express";
import { commentServices } from "./comment.service";
import { auth } from "../../lib/auth";


const createComment = async (req: Request, res: Response) => {
    try {
        req.body.authorId = req.user?.id;
        const result = await commentServices.createComment(req.body);
        res.status(201).json({ result });
    } catch (error) {
        res.status(400).json({
            error: "Comment creation failed",
            details: error,
        })
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await commentServices.getCommentById(commentId);
        res.status(200).json({ result });
    } catch (error) {
        res.status(400).json({
            error: "Comment fetching failed",
            details: error,
        })
    }
}
const getCommentByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params
        // console.log(authorId);
        const result = await commentServices.getCommentByAuthor(authorId);
        res.status(200).json({ result });
    } catch (error) {
        res.status(400).json({
            error: "Comment fetching failed",
            details: error,
        })
    }
}
const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const user = req.user;
        const result = await commentServices.deleteComment(commentId as string, user?.id as string);
        res.status(200).json({ result });
    } catch (error: any) {
        res.status(400).json({
            error: "Deleting comment failed",
            details: error,
        })
    }
}
const updateComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const user = req.user;
        const result = await commentServices.updateComment(commentId as string, req.body, user?.id as string);
        res.status(200).json({ result });
    } catch (error: any) {
        res.status(400).json({
            error: "Comment update failed",
            details: error,
        })
    }
}
export const commentControllers = {
    createComment,
    getCommentById, getCommentByAuthor, deleteComment, updateComment,
}