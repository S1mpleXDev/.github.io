import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ObfuscationLevelSelectorProps {
  selectedLevel: "simple" | "medium" | "extreme";
  onLevelChange: (level: "simple" | "medium" | "extreme") => void;
}

const levels = [
  {
    value: "simple" as const,
    label: "Simple",
    description: "Fast obfuscation with basic protection",
    icon: ShieldCheck,
    color: "text-chart-1",
    badgeVariant: "default" as const,
    shields: 1,
    features: ["Variable renaming", "String encryption", "Basic VM wrapping"],
  },
  {
    value: "medium" as const,
    label: "Medium",
    description: "Balanced security and performance",
    icon: Shield,
    color: "text-chart-3",
    badgeVariant: "secondary" as const,
    shields: 2,
    features: ["All Simple features", "Number virtualization", "Dead code injection", "Control flow obfuscation"],
  },
  {
    value: "extreme" as const,
    label: "Extreme",
    description: "Maximum protection, impossible to crack",
    icon: ShieldAlert,
    color: "text-destructive",
    badgeVariant: "destructive" as const,
    shields: 3,
    features: ["All Medium features", "Advanced VM layers", "Opaque predicates", "Anti-debugging", "Heavy junk code"],
  },
];

export default function ObfuscationLevelSelector({
  selectedLevel,
  onLevelChange,
}: ObfuscationLevelSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Protection Level
        </CardTitle>
        <CardDescription>
          Choose the security level for your script
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedLevel} onValueChange={(value) => onLevelChange(value as any)}>
          <div className="space-y-3">
            {levels.map((level) => {
              const Icon = level.icon;
              const isSelected = selectedLevel === level.value;

              return (
                <div
                  key={level.value}
                  className={`
                    relative rounded-lg border p-4 cursor-pointer transition-all
                    hover-elevate
                    ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-card-border bg-card"
                    }
                  `}
                  onClick={() => onLevelChange(level.value)}
                  data-testid={`level-${level.value}`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={level.value}
                      id={level.value}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={level.value}
                        className="flex items-center gap-2 cursor-pointer mb-1"
                      >
                        <Icon className={`w-5 h-5 ${level.color}`} />
                        <span className="font-semibold text-base">{level.label}</span>
                        <div className="flex gap-0.5 ml-1">
                          {Array.from({ length: level.shields }).map((_, i) => (
                            <Shield
                              key={i}
                              className={`w-3 h-3 ${level.color} fill-current`}
                            />
                          ))}
                        </div>
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {level.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {level.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
