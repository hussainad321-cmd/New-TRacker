import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import YarnInventory from "@/pages/YarnInventory";
import Knitting from "@/pages/Knitting";
import Cutting from "@/pages/Cutting";
import Stitching from "@/pages/Stitching";
import Pressing from "@/pages/Pressing";
import Packing from "@/pages/Packing";

import { SidebarProvider } from "@/components/ui/sidebar";

function Router() {
  return (
    <div className="flex min-h-screen w-full">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/yarn" component={YarnInventory} />
        <Route path="/knitting" component={Knitting} />
        <Route path="/cutting" component={Cutting} />
        <Route path="/stitching" component={Stitching} />
        <Route path="/pressing" component={Pressing} />
        <Route path="/packing" component={Packing} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
