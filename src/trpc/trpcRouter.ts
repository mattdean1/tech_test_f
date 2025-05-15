import { prismaClient } from "../../prisma/prismaClient";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

import { POSTS_PER_PAGE, COMMENTS_PER_PAGE } from "@/config";

const t = initTRPC.create({
  transformer: superjson,
});

export const trpcRouter = t.router({
  getPosts: t.procedure
    .input(
      z.object({
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor } = input ?? {};
      const hasCursor = cursor !== undefined && cursor !== null;

      const posts = await prismaClient.post.findMany({
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
        where: {
          published: true,
        },
        orderBy: { id: "desc" },
        take: POSTS_PER_PAGE + 1,
        cursor: hasCursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > POSTS_PER_PAGE) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  getComments: t.procedure
    .input(
      z.object({
        postId: z.number(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor } = input;
      const hasCursor = cursor !== undefined && cursor !== null;

      const comments = await prismaClient.comment.findMany({
        where: { postId: input.postId },
        orderBy: { id: "desc" },
        take: COMMENTS_PER_PAGE + 1,
        cursor: hasCursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (comments.length > COMMENTS_PER_PAGE) {
        const nextItem = comments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        comments,
        nextCursor,
      };
    }),

  addComment: t.procedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const comment = await prismaClient.comment.create({
        data: {
          postId: input.postId,
          content: input.content,
        },
      });
      return comment;
    }),
});

export type TrpcRouter = typeof trpcRouter;
