import { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";

export type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.ElementType;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <LucideIcon {...props} />;
}
