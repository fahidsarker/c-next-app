import { PATH } from "@/path";
import { getCurrentUser } from "@/repo/user";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect(PATH.LOGIN);
  }
  redirect(PATH.OF_USER_SLUG(user.slug));
};

export default page;
