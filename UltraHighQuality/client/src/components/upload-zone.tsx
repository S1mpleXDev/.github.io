import { useCallback, useState } from "react";
import { Upload, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onFileSelect: (file: File, content: string) => void;
}

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.name.endsWith(".lua") && !file.name.endsWith(".txt")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .lua or .txt file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        const content = await file.text();
        
        // Basic validation for Lua code
        if (content.trim().length < 5) {
          toast({
            title: "File too short",
            description: "The file must contain at least 5 characters",
            variant: "destructive",
          });
          return;
        }

        onFileSelect(file, content);
      } catch (error) {
        toast({
          title: "Error reading file",
          description: "Failed to read the file content",
          variant: "destructive",
        });
      }
    },
    [onFileSelect, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".lua,.txt";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative min-h-[280px] rounded-lg border-2 border-dashed
        flex flex-col items-center justify-center gap-4
        cursor-pointer transition-all duration-200
        hover-elevate
        ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border bg-card/50"
        }
      `}
      data-testid="upload-zone"
    >
      <div className="text-center space-y-4 px-6">
        <div
          className={`
          w-16 h-16 rounded-full mx-auto flex items-center justify-center
          transition-all duration-200
          ${isDragging ? "bg-primary/20 scale-110" : "bg-muted"}
        `}
        >
          {isDragging ? (
            <Upload className="w-8 h-8 text-primary" />
          ) : (
            <FileCode className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">
            {isDragging ? "Drop your file here" : "Drop Lua script here"}
          </h3>
          <p className="text-sm text-muted-foreground">
            or click to browse
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          <FileCode className="w-3 h-3" />
          .lua, .txt • Max 5MB
        </div>
      </div>
    </div>
  );
}
