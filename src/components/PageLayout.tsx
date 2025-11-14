// PageLayout.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSeo } from "@/hooks/useSeo";

const queryClient = new QueryClient();

interface Props {
  children: React.ReactNode;
  page: string;
}

const PageLayout = ({ children, page }: Props) => {
  const { SeoHelmet } = useSeo(page);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SeoHelmet />
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default PageLayout;
