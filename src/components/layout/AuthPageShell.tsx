import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

interface AuthPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthPageShell({ title, description, children }: AuthPageShellProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <BrandLogo />
      </div>
      <h1 className="text-center text-2xl font-extrabold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-center text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}