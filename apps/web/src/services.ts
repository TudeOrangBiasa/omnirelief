import { createDb } from "@omnirelief/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
