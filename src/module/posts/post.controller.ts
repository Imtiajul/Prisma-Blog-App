import { Request, Response } from "express";
import { postService } from "./post.service";
import { success } from "better-auth/*";
import { PostStatus } from "../../../generated/prisma/enums";

const getAllPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        // console.log(search);
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === 'true'
                ? true :
                req.query.isFeatured === "false"
                    ? false : undefined
            : undefined;

        const status = req.query.status as PostStatus | undefined;

        const authorId = req.query.authorId as string | undefined;

        // console.log(typeof(req.query.isFeatured))
        const searchString = typeof search === 'string' ? search : undefined;
        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId});

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: "Unsuccessful error in fetching data",
            details: error
        })
    }
}

const createPost = async (req: Request, res: Response) => {
    // console.log(req, res);
    try {
        console.log(req.user, 'user');
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorised!",
            })
        }
        const result = await postService.createPost(req.body, user.id as string);
        res.status(201).json({ result });
    } catch (error) {
        res.status(400).json({
            error: "Post creation not successful",
            details: error,
        })
    }
}

export const postController = {
    createPost, getAllPost
}