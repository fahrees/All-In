import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import Portfolios from "@/pages/Portfolios";
import PortfolioDetail from "@/pages/PortfolioDetail";
import Insights from "@/pages/Insights";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium tracking-widest uppercase text-sm">Authenticating...</p>
      </div>
    );
  }
  
  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/portfolios" component={Portfolios} />
        <Route path="/portfolios/:id" component={PortfolioDetail} />
        <Route path="/insights" component={Insights} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
