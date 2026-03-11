import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ImageOverridesProvider } from "./contexts/ImageOverridesContext";
import { CityProvider } from "./contexts/CityContext";
import Home from "./pages/Home";
import UniModePage from "./pages/UniModePage";
import BristolHome from "./pages/BristolHome";
import BristolUniModePage from "./pages/BristolUniModePage";
import CitySelector from "./pages/CitySelector";
import AdminPanel from "./pages/AdminPanel";
import AdminImageManager from "./pages/AdminImageManager";
import PWAInstallBanner from "./components/PWAInstallBanner";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* City selector — landing page */}
      <Route path={"/"} component={CitySelector} />
      <Route path={"/cities"} component={CitySelector} />

      {/* London routes */}
      <Route path={"/london"} component={Home} />
      <Route path={"/london/uni"} component={UniModePage} />

      {/* Bristol routes */}
      <Route path={"/bristol"} component={BristolHome} />
      <Route path={"/bristol/uni"} component={BristolUniModePage} />

      {/* Admin routes */}
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/admin/images"} component={AdminImageManager} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <CityProvider>
            <ImageOverridesProvider>
              <Toaster />
              <Router />
              <PWAInstallBanner />
            </ImageOverridesProvider>
          </CityProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
