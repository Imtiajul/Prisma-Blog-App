import { updateUser } from "better-auth/api";
import { Post } from "../../../generated/prisma/client";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";
import { version } from "node:os";

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
        select: { comments: true }
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
const getMyPosts = async (authorId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: authorId,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      status: true
    }
  })
  if (!user) {
    throw new Error("Sorry, Your account is inactive!!!");
  }
  const postData = await prisma.post.findMany({
    where: {
      authorId,
    },
    include: {
      _count: {
        select: {
          comments: true,
        }
      }
    }
  })
  if (postData.length === 0) {
    throw new Error("Add Some Post... :)");
  }

  const count = await prisma.post.aggregate({
    _count: {
      id: true,
    },
    where: {
      authorId
    }
  })
  return { postData, count };
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

//*/
// user - sudu nijer post update korte parbe, isFeature update korte parbe na
// admin - sobar post update korte parbe
// */
const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
  // console.log(postId, data, authorId);

  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId
    },
    select: {
      id: true,
      authorId: true,
    }
  });
  // console.log(postData);
  //only user
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not owner/creator of the post!");
  }
  if (!isAdmin) {
    delete data.isFeatured
  }
  return await prisma.post.update({
    where: {
      id: postData.id,
    },
    data
  })
}

// ** 
// 1. user - sudu nijer post delete korte parbe
// 2. admin - onner post o delete korte parbe
// */
const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {

  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId
    },
    select: {
      id: true,
      authorId: true,
    }
  });
  // console.log(postData);
  //only user
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not owner/creator of the post!");
  }
  return await prisma.post.delete({
    where: {
      id: postData.id,
    }
  })
}
const getStates = async () => {
  // totalPost, totalPublished, draft, view, comment
  return await prisma.$transaction(async (tx) => {
    const [totalAdmin, totalUser, totalPost, totalPublished, totalDraft, totalArchived, totalComment, totalCommentApproved, totalPostViews] = await Promise.all([
      await tx.user.count({ where: { role: UserRole.ADMIN } }),
      await tx.user.count({ where: { role: UserRole.USER } }),
      await tx.post.count(),
      await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.post.count({ where: { status: PostStatus.DRAFT } }),
      await tx.post.count({ where: { status: PostStatus.ARCHIEVED } }),
      await tx.comment.count(),
      await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.post.aggregate({ _sum: { views: true } }),


    ])
    return {
      totalUsers: totalAdmin + totalUser,
      totalAdmin,
      totalUser,
      totalPost,
      totalPublished,
      totalDraft,
      totalArchived,
      totalComment,
      totalCommentApproved,
      totalPostViews: totalPostViews._sum.views,
    }
  })


}
export const postService = {
  createPost, getAllPost, getPostById, getMyPosts, updatePost, deletePost, getStates,
}