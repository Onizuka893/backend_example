import { FunctionComponent } from "react";
import { FieldErrors } from "react-hook-form";
import { ActionResponse } from "@/lib/models/actions";

interface FormErrorProps {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formErrors: FieldErrors<any>;
  serverErrors: ActionResponse;
}

const FormError: FunctionComponent<FormErrorProps> = ({
  path,
  formErrors,
  serverErrors,
}) => {
  const formError = path
    .split(".")
    .reduce((acc, key) => (acc ? (acc[key] as object) : {}), formErrors) as {
    message?: string;
  };

  // Server errors zijn een array, ook voor geneste objecten.
  // Omdat er dus verschillende keren eenzelfde fout in kan zitten, maken we een set zodat enkele de unieke waarden overblijven.
  const serverError = Array.from(
    new Set(serverErrors.errors?.[path.split(".")[0]])
  );

  return (
    <p className="text-red-600">
      {formError?.message ??
        serverError?.map((x) => (
          <span className="block" key={x}>
            {x}
          </span>
        )) ?? <span>&nbsp;</span>}
    </p>
  );
};

export default FormError;
