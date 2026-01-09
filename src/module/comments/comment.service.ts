import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";


const createComment = async (payload: {
    content: string,
    authorId: string,
    postId: string,
    parentId: string,
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId,
        }
    })

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }

    return await prisma.comment.create({
        data: payload,
    })
}

const getCommentById = async (id: string) => {
    return await prisma.comment.findUnique({
        where: {
            id
        },
        include: {
            post: {
                select: {
                    title: true,
                    content: true,
                }
            }
        }
    })
}
const getCommentByAuthor = async (authorId: string) => {
    // console.log(authorId);
    return await prisma.comment.findMany({
        where: {
            authorId
        },
        orderBy: { createdAt: 'desc' },
        include: {
            post: {
                select: {
                    title: true,
                    content: true,
                }
            }
        }
    })
}
const deleteComment = async (commentId: string, authorId: string) => {
    // console.log(authorId);
    // console.log(commentId)
    const commentData = await prisma.comment.findFirstOrThrow({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true,
        }
    });

    return await prisma.comment.delete({
        where: {
            id: commentData.id,
        }
    })
}

const updateComment = async (commentId: string, data: { content?: string, status: CommentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true,
        }
    });
    if (!commentData) {
        throw new Error("Your provided input is invalid!");
    }
    return await prisma.comment.update({
        where: {
            id: commentId,
            authorId
        },
        data
    })
}

export const commentServices = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment, updateComment,
}