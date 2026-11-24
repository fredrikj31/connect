import { PostLikeSchema, PostSchema } from "@connect/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
import { PublicProfileSchema } from "../../schemas/publicProfile";
import { createPostHandler } from "./handlers/createPost";
import { deletePostHandler } from "./handlers/deletePost";
import { likePostHandler } from "./handlers/likePost";
import { listPostsHandler } from "./handlers/listPosts";
import { unlikePostHandler } from "./handlers/unlikePost";

const PostLikeSummarySchema = PostLikeSchema.pick({
  id: true,
  postId: true,
  userId: true,
});

export const postRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/posts", not "/posts/"
      onRequest: validateSession(),
      schema: {
        summary: "Create post",
        description: "Creates a new post written by the signed-in user.",
        tags: ["posts"],
        security: [{ session: [] }],
        // `userId` comes from the session.
        body: PostSchema.pick({ content: true }),
        response: {
          "201": z
            .object({
              data: PostSchema.pick({
                id: true,
                userId: true,
                content: true,
                createdAt: true,
              }),
            })
            .describe("Returns the created post."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const post = await createPostHandler({
        database,
        userId,
        body: req.body,
      });
      return res.status(201).send({ data: post });
    },
  );

  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/posts", not "/posts/"
      onRequest: validateSession(),
      schema: {
        summary: "List feed",
        description:
          "Lists the posts of the signed-in user and their friends, newest first, each with the author's public profile.",
        tags: ["posts"],
        security: [{ session: [] }],
        response: {
          "200": z
            .object({
              data: z.array(
                PostSchema.pick({
                  id: true,
                  content: true,
                  createdAt: true,
                }).extend({ user: PublicProfileSchema }),
              ),
            })
            .describe("Returns the signed-in user's feed."),
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const posts = await listPostsHandler({ database, userId });
      return res.send({ data: posts });
    },
  );

  app.delete(
    "/:postId",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Delete post",
        description:
          "Deletes a post written by the signed-in user. Posts written by other users are reported as not found.",
        tags: ["posts"],
        security: [{ session: [] }],
        params: z.object({ postId: z.uuid() }),
        response: {
          "204": z.undefined().describe("The post was deleted."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      await deletePostHandler({ database, userId, params: req.params });
      return res.status(204).send(undefined);
    },
  );

  app.put(
    "/:postId/likes",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Like or unlike post",
        description:
          "Likes or unlikes a post on behalf of the signed-in user. Liking an already liked post is a no-op.",
        tags: ["posts"],
        security: [{ session: [] }],
        params: z.object({ postId: z.uuid() }),
        body: z.object({ status: z.enum(["like", "unlike"]) }),
        response: {
          "200": z
            .object({ data: PostLikeSummarySchema })
            .describe("Returns the like."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const like =
        req.body.status === "like"
          ? await likePostHandler({ database, userId, params: req.params })
          : await unlikePostHandler({ database, userId, params: req.params });
      return res.send({ data: like });
    },
  );
};
