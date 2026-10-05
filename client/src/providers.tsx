import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { authClient } from "./lib/authClient";

// If you install @daveyplate/better-auth-ui, wrap children in <AuthUIProvider authClient={authClient}>
// here instead of the plain fragment below.
const Providers = ({ children }: { children: ReactNode }) => {
  void authClient; // keep the import wired up for when AuthUIProvider is added
  return (
    <>
      {children}
      <Toaster richColors position="top-center" theme="dark" />
    </>
  );
};

export default Providers;
