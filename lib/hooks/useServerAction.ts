import { useState } from "react";

/**
 * Een eenvoudige utility hook die ons helpt bij het aanroepen van een server action.
 * Deze hook voorziet een wrapper rond de actie die bijhoudt of de actie al dan niet bezig is.
 *
 * @param action De server action.
 * @return Een 2-tuple met een boolean die aangeeft of de actie bezig is en een functie om de action aan te roepen.
 */
function useServerAction<T, R>(
  action: (params: T) => Promise<R>
): [boolean, (params: T) => Promise<R>] {
  const [isPending, setIsPending] = useState(false);

  const callServerAction = async (params: T): Promise<R> => {
    setIsPending(true);
    const returnValue = await action(params);
    setIsPending(false);
    return returnValue;
  };

  return [isPending, callServerAction];
}

export default useServerAction;
