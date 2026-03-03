"use client";

import * as React from "react";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "../Field/Field";
import { cn } from "../../../lib/utils/cn";

type FormFieldContextValue = {
  name: string;
  id: string;
  invalid: boolean;
  error?: { message?: string };
  field: {
    value: unknown;
    onChange: (e: unknown) => void;
    onBlur: () => void;
    ref: React.RefCallback<HTMLInputElement>;
    name: string;
  };
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const ctx = React.useContext(FormFieldContext);
  if (!ctx) {
    throw new Error("Form components must be used within FormField.");
  }
  return ctx;
}

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  render: (props: {
    field: { value: unknown; onChange: (e: unknown) => void; onBlur: () => void; ref: React.RefCallback<HTMLInputElement>; name: TName };
    fieldState: { invalid: boolean; error?: { message?: string } };
  }) => React.ReactNode;
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, render, ...rest }: FormFieldProps<TFieldValues, TName>) {
  const id = React.useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldContext.Provider
          value={{
            name,
            id: `${id}-${String(name)}`,
            invalid: fieldState.invalid,
            error: fieldState.error,
            field: { ...field, ref: field.ref as React.RefCallback<HTMLInputElement> },
          }}
        >
          {render({ field, fieldState })}
        </FormFieldContext.Provider>
      )}
      {...rest}
    />
  );
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Field>
>(function FormItem({ className, ...props }, ref) {
  const { invalid } = useFormField();
  return (
    <Field
      ref={ref}
      data-invalid={invalid}
      className={cn(className)}
      {...props}
    />
  );
});

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof FieldLabel>,
  React.ComponentProps<typeof FieldLabel>
>(function FormLabel({ className, ...props }, ref) {
  const { id } = useFormField();
  return (
    <FieldLabel
      ref={ref}
      htmlFor={id}
      className={cn(className)}
      {...props}
    />
  );
});

function FormControl({
  children,
}: { children: React.ReactElement<{ id?: string; ref?: unknown; value?: unknown; onChange?: unknown; onBlur?: unknown; name?: string }> }) {
  const { field, id } = useFormField();
  const child = React.Children.only(children);
  if (!React.isValidElement(child)) return null;
  return React.cloneElement(child, {
    id,
    ...field,
  });
}

function FormDescription({ className, ...props }: React.ComponentProps<typeof FieldDescription>) {
  return <FieldDescription className={cn(className)} {...props} />;
}

function FormMessage({ className, ...props }: React.ComponentProps<typeof FieldError>) {
  const { error } = useFormField();
  if (!error?.message) return null;
  return (
    <FieldError
      className={cn(className)}
      errors={[error]}
      {...props}
    />
  );
}

export {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
