export type ValidationErrors = Record<string, string[] | undefined>;
export type ActionResponse = {
  errors?: ValidationErrors;
  success: boolean;
  submittedData?: Record<string, string>;
};
