import {
  FormEventHandler,
  FormHTMLAttributes,
  PropsWithChildren,
  useRef,
} from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { ActionResponse } from "@/lib/models/actions";
import { CircleX } from "lucide-react";

interface FormProps<T extends FieldValues>
  extends PropsWithChildren,
    FormHTMLAttributes<HTMLFormElement> {
  hookForm: UseFormReturn<T>;
  action: (data: FormData) => void;
  actionResult?: ActionResponse;
  id?: string;
}

function Form<T extends FieldValues>({
  id,
  children,
  action,
  hookForm,
  actionResult,
  ...formAttributes
}: FormProps<T>) {
  const { handleSubmit } = hookForm;
  const formRef = useRef<HTMLFormElement>(null);
  const hasBeenValidated = useRef<boolean>(false);

  const onSubmitHandler: FormEventHandler = (evt) => {
    if (!hasBeenValidated.current) {
      // Als het formulier nog niet gevalideerd is aan de client zijde moet de default actie (submitting) geannuleerd
      // worden.
      evt.preventDefault();

      // Valideer het formulier via react-hook-form.
      void handleSubmit(() => {
        hasBeenValidated.current = true;
        // Omdat een update van state en useRef async is, kunnen we hier niet onmiddellijk het formulier opnieuw
        // indienen want dan wordt de update aan hasBeenValidated niet geregistreerd voordat de volgende submit
        // afgehandeld is.
        setTimeout(() => formRef.current?.requestSubmit(), 0);
      })(evt);
    } else {
      // Reset zodat een volgende submit opnieuw gevalideerd moet worden.
      hasBeenValidated.current = false;
    }
  };

  return (
    <form
      ref={formRef}
      action={action}
      {...formAttributes}
      onSubmit={onSubmitHandler}
    >
      {id && (
        <input
          type="hidden"
          {...hookForm.register("id" as FieldPath<T>)}
          defaultValue={id}
        />
      )}
      {actionResult?.errors?.errors && (
        <div className="border border-destructive p-2 rounded my-4 flex items-center gap-4">
          <CircleX className="text-destructive" />
          {actionResult.errors.errors}
        </div>
      )}
      {children}
    </form>
  );
}

export default Form;
