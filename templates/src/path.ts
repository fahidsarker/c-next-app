export const PATH = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  LOGOUT: "/logout",
  HOME: "/",
  FIND_USER: "/me",
  OF_USER_SLUG: (slug: string) => `/${slug}`,
};

export type Paths = `/${string}`;
