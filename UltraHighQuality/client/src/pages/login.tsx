import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Login successful",
          description: "Welcome to SOF Platform",
        });
        onLogin();
      } else {
        const error = await response.json();
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-4/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-chart-4 mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent">
            SOF
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-chart-4 mx-auto mb-3" />
          <h2 className="text-xl text-muted-foreground font-medium">
            Safety of Obfuscation
          </h2>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Military-Grade Lua Protection
          </p>
        </div>

        {/* Login card */}
        <Card className="border-card-border shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold">Admin Access</CardTitle>
            <CardDescription>
              Enter your credentials to access the obfuscation platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter username"
                          disabled={isLoading}
                          className="h-11"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter password"
                          disabled={isLoading}
                          className="h-11"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Login
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            {/* Feature highlights */}
            <div className="mt-8 pt-6 border-t border-border space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Shield className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Military-Grade Security</div>
                  <div className="text-muted-foreground text-xs">Advanced anti-reverse-engineering protection</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Zap className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">3 Protection Levels</div>
                  <div className="text-muted-foreground text-xs">Simple, Medium, and Extreme obfuscation</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Bot Protection</div>
                  <div className="text-muted-foreground text-xs">Smart detection prevents unauthorized access</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Ultra-secure obfuscation platform • Exceeds commercial standards
        </p>
      </div>
    </div>
  );
}
