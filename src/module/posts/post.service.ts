import { Post } from "../../../generated/prisma/client";
import { PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const getAllPost = async ({ search, tags, isFeatured, status, authorId }: {
  search: string | undefined,
  tags: string[] | [],
  isFeatured: boolean | undefined,
  status: PostStatus | undefined,
  authorId: string | undefined,
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


  const posts = await prisma.post.findMany({
    where: {
      AND: andConditions
    }
  });
  return posts;
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
  createPost, getAllPost
}