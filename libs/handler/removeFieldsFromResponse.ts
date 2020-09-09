import { Middleware } from "./";

export const removeFieldsFromResponse = (
  fieldsToRemove: string[]
): Middleware => ({ response }) => {
  const newResponse = Object.assign({}, response);

  fieldsToRemove.forEach((field) => {
    if (newResponse[field] != null) {
      delete newResponse[field];
    }
  });

  return newResponse;
};
