import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
import { getAccountHandler } from "./handlers/getAccount";

/** The signed-in user's own account fields, from the better-auth `user` table. */
export const AccountSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  username: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;

export const accountRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.get(
    "/me",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Get account",
        description: "Gets the account details of the signed-in user.",
        tags: ["accounts"],
        security: [{ session: [] }],
        response: {
          "200": z
            .object({ data: AccountSchema })
            .describe("Returns the signed-in user's account."),
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const account = await getAccountHandler({ database, userId });
      return res.send({ data: account });
    },
  );
};
