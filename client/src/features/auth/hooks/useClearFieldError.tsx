import type { Dispatch, SetStateAction } from "react";

const useClearFieldError = (
  setFieldsError: Dispatch<SetStateAction<Record<string, string[]> | null>>
) => {
  const clearFieldError = (field: string) => {
    if (setFieldsError)
      setFieldsError(prev => {
        if (!prev) return null;
        const { [field]: _, ...rest } = prev;
        return Object.keys(rest).length ? rest : null;
      });
  };

  return clearFieldError;
};

export default useClearFieldError;
