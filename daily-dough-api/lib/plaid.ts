import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { plaidConfig } from "./config";

export const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[plaidConfig.env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": plaidConfig.clientId,
        "PLAID-SECRET": plaidConfig.secret,
      },
    },
  })
);
