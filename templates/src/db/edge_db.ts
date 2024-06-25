import { ENV } from "@/env";
import { User } from "@/models/user";
import { MongoDB } from "mongo-rest-client";

export const edgeDB = MongoDB.connect({
  baseUrl: ENV.MONGODB_URL,
  dbName: ENV.MONGODB_DB,
  apiKey: ENV.MONGODB_API_KEY,
  clusterName: ENV.MONGODB_CLUSTER,
  schemaBuilder: (db) => {
    return {
      users: db.collection<User>("users"),
      auth: db.collection<{
        email: string;
        pHash: string | null;
        provider: "credentials" | "google";
      }>("auth"),
    };
  },
});
