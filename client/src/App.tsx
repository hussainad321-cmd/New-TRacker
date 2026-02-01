import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchProvider } from "@/hooks/use-search";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import YarnInventory from "@/pages/YarnInventory";
import Knitting from "@/pages/Knitting";
import Dyeing from "@/pages/Dyeing";
import Cutting from "@/pages/Cutting";
import Stitching from "@/pages/Stitching";
import Pressing from "@/pages/Pressing";
import Packing from "@/pages/Packing";
import Container from "@/pages/Container";
import RawMaterials from "@/pages/RawMaterials";
import FactoryCosts from "@/pages/FactoryCosts";

import { SidebarProvider } from "@/components/ui/sidebar";

function Router() {
  return (
    <SearchProvider>
      <div className="flex min-h-screen w-full">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/yarn" component={YarnInventory} />
          <Route path="/knitting" component={Knitting} />
          <Route path="/dyeing" component={Dyeing} />
          <Route path="/cutting" component={Cutting} />
          <Route path="/stitching" component={Stitching} />
          <Route path="/pressing" component={Pressing} />
          <Route path="/packing" component={Packing} />
          <Route path="/container" component={Container} />
          <Route path="/raw-materials" component={RawMaterials} />
          <Route path="/factory-costs" component={FactoryCosts} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </SearchProvider>
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
