import { Request, Response } from "express";
import { postService } from "./post.service";
import { success } from "better-auth/*";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth";

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

        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query);

        // console.log(typeof(req.query.isFeatured))
        const searchString = typeof search === 'string' ? search : undefined;
        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: "Unsuccessful error in fetching data",
            details: error
        })
    }
}
const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const result = await postService.getPostById(postId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: "Unsuccessful error in fetching post data",
            details: error.message
        })
    }
}

const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        // console.log(user);
        if (!user) {
            throw new Error("You are not authorised, bro!!!");
        }
        const result = await postService.getMyPosts(user?.id);
        res.status(200).json(result);

    } catch (error: any) {
        // console.log(error);
        res.status(400).json({
            success: false,
            error: "Unsuccessful error in fetching post data",
            details: error.message
        })
    }
}
const createPost = async (req: Request, res: Response) => {
    // console.log(req, res);
    try {
        // console.log(req.user, 'user');
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
const updatePost = async (req: Request, res: Response) => {
    // console.log(req, res);
    try {
        // console.log(req.user, 'user');
        const user = req.user;
        console.log(user);
        if (!user) {
            throw new Error("Unauthorised Access!");
        }
        const isAdmin = user.role === UserRole.ADMIN;
        const { postId } = req.params;
        const result = await postService.updatePost(postId, req.body, user.id as string, isAdmin);
        res.status(201).json({ result });
    } catch (error: any) {
        res.status(400).json({
            error: "Post update failed!!",
            details: error.message,
        })
    }
}
const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("Unauthorised Access!");
        }
        const isAdmin = user.role === UserRole.ADMIN;
        const { postId } = req.params;
        const result = await postService.deletePost(postId, user.id as string, isAdmin);
        res.status(201).json({ result });
    } catch (error: any) {
        res.status(400).json({
            error: "Post deletion failed!!",
            details: error.message,
        })
    }
}
const getStates = async (req: Request, res: Response) => {
    try {
       
        const result = await postService.getStates();
        res.status(201).json({ result });
    } catch (error: any) {
        res.status(400).json({
            error: "States fetching failed!!",
            details: error.message,
        })
    }
}

export const postController = {
    createPost, getAllPost, getPostById, getMyPosts, updatePost, deletePost, getStates
}