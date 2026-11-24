import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getUser } from "../../../services/database/queries/user/getUser";
import { Account } from "..";

interface GetAccountHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const getAccountHandler = async ({
  database,
  userId,
}: GetAccountHandlerOptions): Promise<Account> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const user = await getUser(database, { id: userId });
  if (!user) {
    throw new NotFoundError({
      code: "account-not-found",
      message: "The account was not found",
    });
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username ?? "",
  };
};
