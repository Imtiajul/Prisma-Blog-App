import { Post } from "../../../generated/prisma/client";
import { PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const getAllPost = async ({ search, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder }: {
  search: string | undefined,
  tags: string[] | [],
  isFeatured: boolean | undefined,
  status: PostStatus | undefined,
  authorId: string | undefined,
  page: number,
  limit: number,
  skip: number,
  sortBy: string,
  sortOrder: string
}) => {
  // console.log(payload.search)
  const andConditions: PostWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive"
          }
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive"
          }
        },
        {
          tags: {
            has: search as string,
          }
        }

      ],
    })
  }
  if (tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags as string[],
      }
    })
  }
  if (typeof isFeatured === "boolean") {
    andConditions.push({ isFeatured })
  }
  if (status) {
    andConditions.push({ status })
  }
  if (authorId) {
    andConditions.push({ authorId })
  }


  const allPosts = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    }
    // 2nd method algo
    // orderBy: sortBy && sortOrder ? {
    //   [sortBy]: sortOrder
    // } : {
    //   createdAt: "desc",
    // }
  });

  const total = await prisma.post.count();


  return {
    data: allPosts,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    }

  };
}
const getPostById = async (postId: string) => {
  console.log('postId', postId);

    const postData = await prisma.post.findUnique({
      where: {
        id: postId
      }
    })
    if(!postData) {
      throw new Error("Wrong Post Id.");
    }
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId
      },
      data: {
        views: {
          increment: 1,
        }
      }
    })
    const postData = await tx.post.findUnique({
      where: {
        id: postId
      }
    })
    console.log('postData', postData);
    return postData;
  })
}

const createPost = async (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    }
  })
  return result;
}

export const postService = {
  createPost, getAllPost, getPostById
}