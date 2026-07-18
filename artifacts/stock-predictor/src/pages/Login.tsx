import { useState } from "react";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loginMutation = useLoginUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      data: { email, password }
    }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ 
          title: "Login failed", 
          description: err.message || "Invalid credentials", 
          variant: "destructive" 
        });
      }
    });
  };

  const loadDemo = () => {
    setEmail("demo@stockai.com");
    setPassword("demo123");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-2 mb-8 group z-10">
        <LineChart className="w-8 h-8 text-primary" />
        <span className="font-bold text-2xl tracking-tight">StockAI</span>
      </Link>

      <Card className="w-full max-w-md glass-card border-white/10 glow-border z-10 relative">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 border-white/10"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Sign up</Link>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 w-full text-center">
              <Button type="button" variant="ghost" className="text-xs text-muted-foreground" onClick={loadDemo}>
                Use Demo Credentials
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
