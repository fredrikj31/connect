import { z } from "zod";
import { apiClient } from "../../client";
import { Account, AccountSchema } from "../../../types/account";

export const getAccount = async (): Promise<Account> => {
  const response = await apiClient.get<unknown>("/accounts/me");
  return z.object({ data: AccountSchema }).parse(response.data).data;
};
