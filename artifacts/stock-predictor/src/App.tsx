import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

// Pages
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Predict from '@/pages/Predict';
import Indicators from '@/pages/Indicators';
import Compare from '@/pages/Compare';
import Portfolio from '@/pages/Portfolio';
import About from '@/pages/About';
import News from '@/pages/News';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    } else if (!isLoading && adminOnly && !isAdmin) {
      setLocation('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly, setLocation]);

  if (isLoading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return <Component />;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/predict" component={Predict} />
          <Route path="/indicators" component={Indicators} />
          <Route path="/compare" component={Compare} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/about" component={About} />
          <Route path="/news" component={News} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          <Route path="/profile">
            <ProtectedRoute component={Profile} />
          </Route>
          
          <Route path="/admin">
            <ProtectedRoute component={Admin} adminOnly />
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
