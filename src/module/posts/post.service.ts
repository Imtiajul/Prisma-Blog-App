import { Post } from "../../../generated/prisma/client";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { commentServices } from "../comments/comment.service";

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
    },
    include: {
      _count: {
        select: {comments: true}
      }
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
  const postData = await prisma.post.findUnique({
    where: {
      id: postId
    }
  })
  if (!postData) {
    throw new Error("Wrong Post Id.");
  }
  //post view increamnet
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
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: { createdAt: "asc" },
              include: {
                replies: {
                  orderBy: { createdAt: "asc" },
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  // include: {
                  //   replies: {
                  //     where: {
                  //       status: CommentStatus.APPROVED,
                  //     }
                  //   }
                  // }
                }
              }
            }
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    })
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