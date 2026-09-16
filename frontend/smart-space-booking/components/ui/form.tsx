'use client';

import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Perekat antara react-hook-form dan komponen tampilan.
 *
 * Setiap field membagikan satu id yang sama ke label, input, deskripsi, dan pesan
 * errornya lewat konteks, sehingga `htmlFor`, `aria-describedby`, dan
 * `aria-invalid` selalu tersambung tanpa perlu diingat di setiap form.
 */

const Form = FormProvider;

interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);
const FormItemContext = React.createContext<{ id: string } | null>(null);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name ?? '' });

  if (!fieldContext || !itemContext) {
    throw new Error('useFormField harus dipakai di dalam <FormField>');
  }

  const state = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-input`,
    formDescriptionId: `${id}-deskripsi`,
    formMessageId: `${id}-pesan`,
    ...state,
  };
}

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={Boolean(error)}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * Menyambungkan input anaknya ke label dan pesan errornya.
 *
 * base-ui tidak menyediakan komponen Slot seperti Radix, sehingga atributnya
 * ditempelkan langsung ke elemen anak. Anaknya harus tepat satu elemen.
 */
function FormControl({ children }: { children: React.ReactElement }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      id: formItemId,
      'aria-describedby': error
        ? `${formDescriptionId} ${formMessageId}`
        : formDescriptionId,
      'aria-invalid': error ? true : undefined,
    },
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/** Menampilkan pesan validasi, dari zod maupun dari backend. */
function FormMessage({ className, children, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const isi = error ? String(error.message ?? '') : children;

  if (!isi) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {isi}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
