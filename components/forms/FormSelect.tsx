import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";
import { useFormContext } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  options: Option[];
  description?: string;
  containerClassName?: string;
}

export function FormSelect({
  name,
  label,
  options,
  description,
  containerClassName,
  className,
  ...props
}: FormSelectProps) {
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
      <select
        id={name}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...register(name)}
        {...props}
      >
        <option value="" disabled>
          Sélectionner...
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
