import React from 'react';
import {
  useForm,
  UseFormReturn,
  FieldValues,
  UseFormProps,
  FormProvider,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface FormProps<TFormValues extends FieldValues> {
  schema: z.ZodType<TFormValues>;
  onSubmit: (data: TFormValues) => void | Promise<void>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  options?: UseFormProps<TFormValues>;
  className?: string;
}

export function Form<TFormValues extends FieldValues>({
  schema,
  onSubmit,
  children,
  options,
  className,
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
        {children(methods)}
      </form>
    </FormProvider>
  );
}
