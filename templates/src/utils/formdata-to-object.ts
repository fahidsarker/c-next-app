export const formDataToObject = (formData: FormData) => {
  const object: Record<string, string> = {};
  formData.forEach((value, key) => {
    object[key] = value as string;
  });
  return object;
};
