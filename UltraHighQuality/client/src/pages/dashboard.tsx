import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ObfuscateResponse, ScriptListItem } from "@shared/schema";
import { Upload, Shield, Download, Copy, Trash2, Users, CheckCircle2, FileCode, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import UploadZone from "@/components/upload-zone";
import ObfuscationLevelSelector from "@/components/obfuscation-level-selector";
import ResultsPanel from "@/components/results-panel";
import ScriptTable from "@/components/script-table";
import ActiveUsersCounter from "@/components/active-users-counter";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<"simple" | "medium" | "extreme">("medium");
  const [result, setResult] = useState<ObfuscateResponse | null>(null);
  const { toast } = useToast();

  // Fetch scripts list
  const { data: scripts = [], isLoading: scriptsLoading } = useQuery<ScriptListItem[]>({
    queryKey: ["/api/scripts"],
  });

  // Obfuscate mutation
  const obfuscateMutation = useMutation({
    mutationFn: async (data: { code: string; level: string }) => {
      return await apiRequest<ObfuscateResponse>("POST", "/api/obfuscate", data);
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Obfuscation complete",
        description: `Successfully obfuscated ${data.originalSize} bytes to ${data.obfuscatedSize} bytes`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Obfuscation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((file: File, content: string) => {
    setSelectedFile(file);
    setFileContent(content);
    setResult(null);
  }, []);

  const handleObfuscate = () => {
    if (!fileContent) {
      toast({
        title: "No file selected",
        description: "Please upload a Lua script first",
        variant: "destructive",
      });
      return;
    }

    obfuscateMutation.mutate({
      code: fileContent,
      level: selectedLevel,
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileContent("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-primary to-chart-4">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                SOF
              </h1>
              <p className="text-xs text-muted-foreground">Safety of Obfuscation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ActiveUsersCounter />
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
              Bot Protection Active
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container px-6 py-8 max-w-7xl mx-auto">
        <Tabs defaultValue="obfuscate" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="obfuscate" data-testid="tab-obfuscate">
              <FileCode className="w-4 h-4 mr-2" />
              Obfuscate
            </TabsTrigger>
            <TabsTrigger value="scripts" data-testid="tab-scripts">
              <Clock className="w-4 h-4 mr-2" />
              Scripts ({scripts.length})
            </TabsTrigger>
          </TabsList>

          {/* Obfuscate Tab */}
          <TabsContent value="obfuscate" className="space-y-6">
            {/* Info Alert */}
            <Alert className="border-primary/20 bg-primary/5">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Upload your Lua script and select a protection level. The obfuscated code will be
                served with advanced bot detection preventing unauthorized access.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column: Upload & Configuration */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Script
                    </CardTitle>
                    <CardDescription>
                      Drop your .lua or .txt file here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UploadZone onFileSelect={handleFileSelect} />
                    {selectedFile && (
                      <div className="mt-4 p-3 rounded-md bg-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          data-testid="button-clear-file"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <ObfuscationLevelSelector
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                />

                <Button
                  onClick={handleObfuscate}
                  disabled={!fileContent || obfuscateMutation.isPending}
                  className="w-full h-12 text-base"
                  size="lg"
                  data-testid="button-obfuscate"
                >
                  {obfuscateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Obfuscating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Obfuscate Script
                    </span>
                  )}
                </Button>
              </div>

              {/* Right Column: Results */}
              <div>
                {result ? (
                  <ResultsPanel result={result} onReset={handleReset} />
                ) : (
                  <Card className="h-full flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Obfuscate</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Upload a script and click "Obfuscate" to see your protected code with
                        military-grade security features.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts">
            <ScriptTable scripts={scripts} isLoading={scriptsLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
