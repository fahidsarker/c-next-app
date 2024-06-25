import NextAuth, { Account, AuthError } from "next-auth";
import { User } from "./models/user";
import Credentials from "next-auth/providers/credentials";
import { edgeDB } from "./db/edge_db";
import { createUniqueSlagFromStr } from "./utils/create-slag";
import Google from "next-auth/providers/google";
import { ENV } from "./env";

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

const encoder = new TextEncoder();

async function hashPassword(password: string): Promise<string> {
  const salt = ENV.AUTH_SALT;
  const iterations = 100000;
  const keylen = 64;
  const encodedPassword = encoder.encode(password);
  const encodedSalt = encoder.encode(salt);

  const key = await crypto.subtle.importKey(
    "raw",
    encodedPassword,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encodedSalt,
      iterations: iterations,
      hash: "SHA-256",
    },
    key,
    keylen * 8 // Length in bits
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
const signUpUser = async (
  provider: "google" | "credentials",
  pwHash: string | null,
  user: Omit<User, "slug">
) => {
  const res = await edgeDB.auth.insertOne({
    email: user.email as string,
    pHash: pwHash,
    provider: provider,
  });
  const nUser = await edgeDB.users.insertOne({
    ...user,
    slug: await createUniqueSlagFromStr({
      baseString: user.name,
      exist: async (slug) => {
        const existing = await edgeDB.users.findOne({ slug });
        return existing ? true : false;
      },
      onFailed: () => res._id,
    }),
  });

  return nUser;
};

const handleOAuthSignup = async (
  account: Account,
  user: any
): Promise<User | undefined> => {
  if (account.provider !== "google") {
    return undefined;
  }
  const email = user.email;
  if (!email) {
    return undefined;
  }
  const existingUser = await edgeDB.users.findOne({ email });
  if (existingUser) {
    return existingUser;
  }

  return await signUpUser("google", null, {
    name: user.name,
    email: email,
    image: user.image,
  });
};

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  callbacks: {
    jwt: async ({ token, account, user }) => {
      if (account) {
        const nUser = await handleOAuthSignup(account, user);
        token.user = nUser ?? user;
      }
      return token;
    },
    session({ session, token, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          ...(token.user as User),
        },
      };
    },
  },

  providers: [
    Google,
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
        fullName: {},
      },

      authorize: async (credentials) => {
        let user: User | undefined = undefined;

        console.log("Credentials", credentials);
        // logic to salt and hash password
        const pwHash = await hashPassword(credentials.password as string);

        const auth = await edgeDB.auth.findOne({
          email: credentials.email as string,
        });
        if (!credentials.fullName) {
          if (!auth) {
            throw new AuthError("User does not exist");
          }
          if (auth.provider !== "credentials" || !auth.pHash) {
            throw new AuthError("Invalid SignIn Method! Please use others!");
          }
          // sign in attempt
          // logic to verify if user exists
          if (auth && pwHash != auth.pHash) {
            // Passwords do not match
            throw new AuthError("Password does not match");
          }

          if (auth) {
            user = await edgeDB.users.findOne({
              email: credentials.email as string,
            });
          }
        }
        if (!user) {
          if (auth) {
            throw new AuthError("User already exists");
          }
          if (
            !credentials.fullName ||
            !credentials.email ||
            !credentials.password
          ) {
            throw new AuthError("Missing required fields");
          }
          // No user found, so this is their first attempt to login
          // meaning this is also the place you could do registration
          user = await signUpUser("credentials", pwHash, {
            name: credentials.fullName as string,
            email: credentials.email as string,
          });
        }

        console.log("User", user);
        // return user object with the their profile data
        return user;
      },
    }),
  ],
});
