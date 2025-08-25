// PageLayout.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

interface Props {
  children: React.ReactNode;
  isProtected?: boolean; // renamed from "protected"
}

const PageLayout = ({ children, isProtected }: Props) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isProtected ? <ProtectedRoute>{children}</ProtectedRoute> : children}
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default PageLayout;
