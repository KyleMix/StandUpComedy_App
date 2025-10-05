import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface IconProps extends SVGProps<SVGSVGElement> {
  icon: IconComponent;
  label?: string;
}

export function Icon({ icon: IconComponent, label, ...props }: IconProps) {
  if (label) {
    return <IconComponent role="img" aria-label={label} {...props} />;
  }

  return <IconComponent aria-hidden="true" {...props} />;
}
