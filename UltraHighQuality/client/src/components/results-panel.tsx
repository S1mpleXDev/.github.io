import { useState } from "react";
import type { ObfuscateResponse } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, ExternalLink, FileCode, Link2, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsPanelProps {
  result: ObfuscateResponse;
  onReset: () => void;
}

export default function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (text: string, type: "code" | "loadstring" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === "loadstring") {
        setCopiedLoadstring(true);
        setTimeout(() => setCopiedLoadstring(false), 2000);
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }

      toast({
        title: "Copied!",
        description: `${type === "code" ? "Obfuscated code" : type === "loadstring" ? "Loadstring" : "URL"} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result.obfuscatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `obfuscated_${result.id}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your obfuscated script is downloading",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "simple":
        return "default";
      case "medium":
        return "secondary";
      case "extreme":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <FileCode className="w-5 h-5 text-chart-2" />
              Obfuscation Complete
            </CardTitle>
            <CardDescription>Your script has been protected</CardDescription>
          </div>
          <Badge variant={getLevelColor(result.level)} className="capitalize">
            {result.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted">
            <div className="text-xs text-muted-foreground mb-1">Original</div>
            <div className="text-lg font-semibold">{(result.originalSize / 1024).toFixed(2)} KB</div>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <div className="text-xs text-muted-foreground mb-1">Obfuscated</div>
            <div className="text-lg font-semibold">{(result.obfuscatedSize / 1024).toFixed(2)} KB</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Ratio
            </div>
            <div className="text-lg font-semibold text-chart-2">{result.compressionRatio.toFixed(2)}x</div>
          </div>
        </div>

        {/* Tabs for different outputs */}
        <Tabs defaultValue="loadstring" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loadstring">Loadstring</TabsTrigger>
            <TabsTrigger value="code">Full Code</TabsTrigger>
          </TabsList>

          <TabsContent value="loadstring" className="space-y-3 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Loadstring (for Roblox)</label>
              <div className="relative">
                <pre className="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto border border-border">
                  {result.loadstring}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(result.loadstring, "loadstring")}
                  data-testid="button-copy-loadstring"
                >
                  {copiedLoadstring ? (
                    <Check className="w-4 h-4 text-chart-2" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Direct URL (protected)</label>
              <div className="relative">
                <pre className="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto border border-border break-all">
                  {result.url}
                </pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(result.url, "url")}
                    data-testid="button-copy-url"
                  >
                    {copiedUrl ? (
                      <Check className="w-4 h-4 text-chart-2" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(result.url, "_blank")}
                    data-testid="button-open-url"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-3 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Obfuscated Code Preview</label>
              <div className="relative">
                <pre className="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto max-h-[300px] border border-border">
                  {result.obfuscatedCode.slice(0, 1000)}
                  {result.obfuscatedCode.length > 1000 && "\n... (truncated)"}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(result.obfuscatedCode, "code")}
                  data-testid="button-copy-code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-chart-2" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleDownload}
            className="flex-1"
            data-testid="button-download"
          >
            <Download className="w-4 h-4 mr-2" />
            Download .lua
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            data-testid="button-new-obfuscation"
          >
            New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
