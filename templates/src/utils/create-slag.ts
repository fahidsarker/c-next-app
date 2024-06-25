import { randNumber } from "./rand_num";

export const createUniqueSlagFromStr = async ({
  baseString,
  exist,
  maxTries = 4,
  onFailed,
}: {
  baseString: string;
  exist: (slag: string) => Promise<boolean>;
  maxTries?: number;
  onFailed: () => string;
}) => {
  const primarySlug = baseString.toLowerCase().replace(/[^a-z0-9]/g, "-");
  let slug = primarySlug;

  let i = 0;

  while (i < maxTries) {
    if (!(await exist(slug))) {
      return slug;
    }

    i += 1;

    slug = `${primarySlug}-${randNumber(1000, 9999)}`;
  }

  return onFailed();
};
