import { useState, useCallback } from "react";

/**
 * Custom hook for managing form state
 * @param {Object} options
 * @param {Object} options.initialValues - Initial form values
 * @param {Function} options.validate - Validation function
 * @param {Function} options.onSubmit - Submit handler
 */
export function useForm({
  initialValues = {},
  validate = () => ({}),
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear error on change
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();

      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) return;

      try {
        setIsSubmitting(true);
        await onSubmit?.(values, { resetForm });
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit, resetForm]
  );

  return {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setErrors,
  };
}
