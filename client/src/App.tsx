import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { GameProvider } from "@/hooks/use-game";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
