import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";
import { useFormContext } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
  containerClassName?: string;
}

export function FormInput({
  name,
  label,
  description,
  containerClassName,
  className,
  ...props
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn("flex flex-col space-y-1.5", containerClassName)}>
      <Label htmlFor={name} className={error ? "text-red-500" : ""}>
        {label}
      </Label>
      <Input
        id={name}
        className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
        {...register(name)}
        {...props}
      />
      {description && !error && (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-[0.8rem] font-medium text-red-500">
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
}
