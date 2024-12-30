import { Dispatch, SetStateAction, useState } from "react";

/**
 * Utility hook to work with array state.
 *
 * @param initialState
 * @returns A 3-tuple with the following structure: [state, setState, updateItem].
 * The `updateItem` function takes an index and a new value and updates the item at the given index.
 * The `deleteItem` function takes one or more indices and deletes the items at the given indices.
 */
export function useArrayState<T>(
  initialState: T[]
): [
  T[],
  Dispatch<SetStateAction<T[]>>,
  (index: number, newValue: T) => void,
  (...indices: number[]) => void
] {
  const [state, setState] = useState<T[]>(initialState);

  const updateItem = (index: number, newValue: T) => {
    setState((prevState) => {
      const newState = [...prevState];
      newState[index] = newValue;
      return newState;
    });
  };

  const deleteItem = (...indices: number[]) => {
    setState((prevState) => {
      const newState = [...prevState];
      indices.forEach((index) => {
        newState.splice(index, 1);
      });
      return newState;
    });
  };

  return [state, setState, updateItem, deleteItem];
}
