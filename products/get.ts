import { lambdas, removeFieldsFromResponse } from "../libs/handler";

export const main = lambdas([
  () => ({
    name: "Josoroma",
    password: "ibm123",
    data: {
      password: "ibm123",
    },
  }),
  removeFieldsFromResponse(["password"]),
]);
