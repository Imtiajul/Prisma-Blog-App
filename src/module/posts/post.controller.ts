import {Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
    // console.log(req, res);
    try {
        console.log(req.user);
        const user = req.user;
        if(!user) {
            return res.status(400).json({
                error: "Unauthorised!",
            })
        }
        const result = await postService.createPost(req.body, user.id as string);
        res.status(201).json({result});
    } catch (error) {
        res.status(400).json({
            error: "Post creation not successful",
            details: error,
        })
    }
}

export const postController = {
    createPost,
}