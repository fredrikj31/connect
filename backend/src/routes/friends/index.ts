import { FriendRequestSchema, FriendSchema } from "@connect/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
import { PublicProfileSchema } from "../../schemas/publicProfile";
import { acceptFriendRequestHandler } from "./handlers/acceptFriendRequest";
import { createFriendRequestHandler } from "./handlers/createFriendRequest";
import { declineFriendRequestHandler } from "./handlers/declineFriendRequest";
import { deleteFriendRequestHandler } from "./handlers/deleteFriendRequest";
import { listFriendsHandler } from "./handlers/listFriends";
import { listReceivedFriendRequestsHandler } from "./handlers/listReceivedFriendRequests";
import { listSentFriendRequestsHandler } from "./handlers/listSentFriendRequests";

const FriendRequestSummarySchema = FriendRequestSchema.pick({
  id: true,
  senderId: true,
  receiverId: true,
  status: true,
  createdAt: true,
});

export const friendRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.get(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/friends", not "/friends/"
      onRequest: validateSession(),
      schema: {
        summary: "List friends",
        description:
          "Lists the friends of the signed-in user with their public profiles.",
        tags: ["friends"],
        security: [{ session: [] }],
        response: {
          "200": z
            .object({
              data: z.array(
                FriendSchema.pick({ id: true, createdAt: true }).extend({
                  friend: PublicProfileSchema,
                }),
              ),
            })
            .describe("Returns the signed-in user's friends."),
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const friends = await listFriendsHandler({ database, userId });
      return res.send({ data: friends });
    },
  );

  app.get(
    "/requests/received",
    {
      onRequest: validateSession(),
      schema: {
        summary: "List received friend requests",
        description:
          "Lists the pending friend requests sent to the signed-in user, with the sender's public profile.",
        tags: ["friends"],
        security: [{ session: [] }],
        response: {
          "200": z
            .object({
              data: z.array(
                FriendRequestSchema.pick({
                  id: true,
                  status: true,
                  createdAt: true,
                }).extend({ sender: PublicProfileSchema }),
              ),
            })
            .describe("Returns the pending requests received by the user."),
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const requests = await listReceivedFriendRequestsHandler({
        database,
        userId,
      });
      return res.send({ data: requests });
    },
  );

  app.get(
    "/requests/sent",
    {
      onRequest: validateSession(),
      schema: {
        summary: "List sent friend requests",
        description:
          "Lists the pending friend requests the signed-in user has sent, with the receiver's public profile.",
        tags: ["friends"],
        security: [{ session: [] }],
        response: {
          "200": z
            .object({
              data: z.array(
                FriendRequestSchema.pick({
                  id: true,
                  status: true,
                  createdAt: true,
                }).extend({ receiver: PublicProfileSchema }),
              ),
            })
            .describe("Returns the pending requests sent by the user."),
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const requests = await listSentFriendRequestsHandler({
        database,
        userId,
      });
      return res.send({ data: requests });
    },
  );

  app.post(
    "/requests",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Send friend request",
        description:
          "Sends a friend request from the signed-in user to another user. Fails when the users are already friends or a request between them is pending.",
        tags: ["friends"],
        security: [{ session: [] }],
        body: z.object({ friendId: z.string().min(1) }),
        response: {
          "201": z
            .object({ data: FriendRequestSummarySchema })
            .describe("Returns the created friend request."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const request = await createFriendRequestHandler({
        database,
        userId,
        body: req.body,
      });
      return res.status(201).send({ data: request });
    },
  );

  app.delete(
    "/requests/:requestId",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Withdraw friend request",
        description:
          "Withdraws a pending friend request sent by the signed-in user. Requests sent by other users are reported as not found.",
        tags: ["friends"],
        security: [{ session: [] }],
        params: z.object({ requestId: z.uuid() }),
        response: {
          "204": z.undefined().describe("The friend request was withdrawn."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      await deleteFriendRequestHandler({
        database,
        userId,
        params: req.params,
      });
      return res.status(204).send(undefined);
    },
  );

  app.put(
    "/requests/:requestId",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Accept or decline friend request",
        description:
          "Resolves a pending friend request received by the signed-in user. Accepting makes the two users friends. Requests received by other users are reported as not found.",
        tags: ["friends"],
        security: [{ session: [] }],
        params: z.object({ requestId: z.uuid() }),
        body: z.object({ status: z.enum(["accepted", "declined"]) }),
        response: {
          "200": z
            .object({ data: FriendRequestSummarySchema })
            .describe("Returns the resolved friend request."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const request =
        req.body.status === "accepted"
          ? await acceptFriendRequestHandler({
              database,
              userId,
              params: req.params,
            })
          : await declineFriendRequestHandler({
              database,
              userId,
              params: req.params,
            });
      return res.send({ data: request });
    },
  );
};
