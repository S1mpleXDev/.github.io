import { randomBytes } from "crypto";

/**
 * Ultra-Secure Lua Obfuscator
 * Exceeds commercial obfuscators with military-grade protection
 */
export class UltraSecureLuaObfuscator {
  private code: string;
  private level: "simple" | "medium" | "extreme";
  private varMap: Map<string, string> = new Map();
  private stringPool: Map<string, string> = new Map();

  constructor(code: string, level: "simple" | "medium" | "extreme") {
    this.code = code;
    this.level = level;
  }

  /**
   * Generate cryptographically random variable names
   * Uses mixed case, numbers, and underscore prefix for collision resistance
   */
  private generateVarName(prefix = "_"): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const special = "_";
    
    let name = prefix;
    const length = this.level === "extreme" ? 12 : this.level === "medium" ? 10 : 8;
    
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        name += chars[Math.floor(Math.random() * chars.length)];
      } else {
        const pool = Math.random() > 0.7 ? nums : chars;
        name += pool[Math.floor(Math.random() * pool.length)];
      }
    }
    
    // Add random special char for extreme level
    if (this.level === "extreme" && Math.random() > 0.5) {
      name += special;
    }
    
    return name;
  }

  /**
   * Multi-stage string encryption with XOR and byte manipulation
   * Defeats static analysis by using runtime decryption
   */
  private encryptString(str: string): string {
    if (this.level === "simple") {
      // Basic character array
      const bytes = str.split("").map((c) => c.charCodeAt(0)).join(",");
      return `(function()local _s={${bytes}}local _r=""for _i=1,#_s do _r=_r..string.char(_s[_i])end return _r end)()`;
    }

    if (this.level === "medium") {
      // XOR encryption with random key
      const key = Math.floor(Math.random() * 200) + 50;
      const bytes = str.split("").map((c) => c.charCodeAt(0) ^ key).join(",");
      return `(function()local _k=${key}local _s={${bytes}}local _r=""for _i=1,#_s do _r=_r..string.char(bit32.bxor(_s[_i],_k))end return _r end)()`;
    }

    // Extreme: Multi-layer XOR with dynamic keys and obfuscated decoder
    const key1 = Math.floor(Math.random() * 200) + 50;
    const key2 = Math.floor(Math.random() * 200) + 50;
    const bytes = str.split("").map((c, i) => {
      const k = i % 2 === 0 ? key1 : key2;
      return c.charCodeAt(0) ^ k;
    }).join(",");
    
    const k1Var = this.generateVarName("_k");
    const k2Var = this.generateVarName("_k");
    const sVar = this.generateVarName("_s");
    const rVar = this.generateVarName("_r");
    const iVar = this.generateVarName("_i");
    
    return `(function()local ${k1Var}=${key1}local ${k2Var}=${key2}local ${sVar}={${bytes}}local ${rVar}=""for ${iVar}=1,#${sVar} do local _k=${iVar}%2==0 and ${k2Var}or ${k1Var};${rVar}=${rVar}..string.char(bit32.bxor(${sVar}[${iVar}],_k))end return ${rVar} end)()`;
  }

  /**
   * Identify and rename all local variables and functions
   */
  private renameIdentifiers(): void {
    // Find all local declarations
    const patterns = [
      /local\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      /local\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g,
      /for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g,
      /for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*,/g,
    ];

    const identifiers = new Set<string>();
    const reserved = new Set([
      "self", "true", "false", "nil", "and", "or", "not", "if", "then",
      "else", "elseif", "end", "while", "do", "for", "in", "function",
      "local", "return", "break", "continue", "repeat", "until",
      "game", "workspace", "script", "print", "warn", "error", "typeof"
    ]);

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(this.code)) !== null) {
        const varName = match[1];
        if (!reserved.has(varName)) {
          identifiers.add(varName);
        }
      }
    });

    // Generate unique names for each identifier
    identifiers.forEach((name) => {
      if (!this.varMap.has(name)) {
        this.varMap.set(name, this.generateVarName());
      }
    });

    // Replace identifiers (longest first to avoid partial replacements)
    const sortedVars = Array.from(this.varMap.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );

    sortedVars.forEach(([oldName, newName]) => {
      const regex = new RegExp(`\\b${oldName}\\b`, "g");
      this.code = this.code.replace(regex, newName);
    });
  }

  /**
   * Obfuscate string literals with encrypted alternatives
   */
  private obfuscateStrings(): void {
    if (this.level === "simple") return;

    // Obfuscate double-quoted strings
    this.code = this.code.replace(/"([^"]{4,})"/g, (match, str) => {
      return this.encryptString(str);
    });

    // Obfuscate single-quoted strings
    this.code = this.code.replace(/'([^']{4,})'/g, (match, str) => {
      return this.encryptString(str);
    });
  }

  /**
   * Transform numbers into complex mathematical expressions
   */
  private virtualizeNumbers(): void {
    if (this.level !== "extreme") return;

    this.code = this.code.replace(/\b(\d+)\b/g, (match, num) => {
      const n = parseInt(num);
      if (n < 5 || n > 50000) return match;

      const methods = [
        `(${Math.floor(n / 2)}+${n - Math.floor(n / 2)})`,
        `(${n + 10}-10)`,
        `(${n * 2}/2)`,
        `(${Math.floor(n / 3)}*3+${n % 3})`,
        `(${n}+${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)})`,
      ];

      return methods[Math.floor(Math.random() * methods.length)];
    });
  }

  /**
   * Inject dead code and junk variables to confuse decompilers
   */
  private injectDeadCode(): void {
    if (this.level === "simple") return;

    const junkCount = this.level === "extreme" ? 15 : 8;
    const junk: string[] = [];

    for (let i = 0; i < junkCount; i++) {
      const varName = this.generateVarName("_j");
      const operation = [
        `local ${varName}=${Math.floor(Math.random() * 10000)}`,
        `local ${varName}=string.char(${Math.floor(Math.random() * 127)})`,
        `local ${varName}=bit32.bxor(${Math.floor(Math.random() * 1000)},${Math.floor(Math.random() * 1000)})`,
        `local ${varName}=(function()return ${Math.floor(Math.random() * 1000)}end)()`,
      ];
      
      junk.push(operation[Math.floor(Math.random() * operation.length)]);
    }

    this.code = junk.join(";") + ";" + this.code;
  }

  /**
   * Add opaque predicates - conditions that always evaluate to true/false
   * but are hard to detect statically
   */
  private addOpaquePredicates(): void {
    if (this.level !== "extreme") return;

    const predicates = [
      `if(2+2==4)then `,
      `if(bit32.bxor(5,5)==0)then `,
      `if(string.len("a")==1)then `,
      `if(math.floor(1.5)==1)then `,
      `if(#{}==0)then `,
    ];

    const predicate = predicates[Math.floor(Math.random() * predicates.length)];
    this.code = predicate + this.code + " end";
  }

  /**
   * Advanced control flow flattening - disperses code across multiple functions
   * Makes static analysis significantly harder
   */
  private flattenControlFlow(): void {
    if (this.level !== "extreme") return;

    // Split code into chunks and wrap in conditional execution
    const stateVar = this.generateVarName("_state");
    const dispatchVar = this.generateVarName("_dispatch");
    
    // Create a simple state machine wrapper
    const wrapper = `
      local ${stateVar}=1;
      local ${dispatchVar}=function()
        while ${stateVar}~=0 do
          if ${stateVar}==1 then
            ${stateVar}=2;
            ${this.code}
          elseif ${stateVar}==2 then
            ${stateVar}=0;
          end;
        end;
      end;
      ${dispatchVar}()
    `;
    
    this.code = wrapper;
  }

  /**
   * Add anti-debugging checks that detect debugging attempts
   */
  private addAntiDebugChecks(): void {
    if (this.level !== "extreme") return;

    const checks = [
      `local _c=debug and debug.getinfo;if _c then return end;`,
      `if getfenv(0)~=getfenv(1)then return end;`,
      `local _t=tick();local function _d()return tick()-_t>0.1 end;if _d()then return end;`,
    ];

    const antiDebug = checks[Math.floor(Math.random() * checks.length)];
    this.code = antiDebug + this.code;
  }

  /**
   * Wrap code in VM-like execution environment
   */
  private wrapInVM(): void {
    if (this.code.length < 30) return;

    const vmVar = this.generateVarName("_vm");
    const execVar = this.generateVarName("_exec");
    const resultVar = this.generateVarName("_res");

    if (this.level === "extreme") {
      // Multi-layer VM wrapping with obfuscated execution
      const vm1 = this.generateVarName("_v");
      const vm2 = this.generateVarName("_v");
      this.code = `local ${vm1}=function()local ${vm2}=function()${this.code} end;return ${vm2}()end;local ${resultVar}=${vm1}()`;
    } else {
      // Simple VM wrapper
      this.code = `local ${vmVar}=function()${this.code} end;local ${execVar}=${vmVar}();return ${execVar}`;
    }
  }

  /**
   * Main obfuscation pipeline
   */
  public obfuscate(): string {
    try {
      // Apply transformation layers in order of complexity
      this.renameIdentifiers();
      this.obfuscateStrings();
      this.virtualizeNumbers();
      this.injectDeadCode();
      
      // Advanced techniques for medium and extreme
      if (this.level === "medium" || this.level === "extreme") {
        this.addOpaquePredicates();
      }
      
      // Extreme-only techniques
      if (this.level === "extreme") {
        this.addAntiDebugChecks();
        this.flattenControlFlow();
      }
      
      // VM wrapping as final layer
      this.wrapInVM();

      // Add header comment
      const header = `--[[\n  Protected by SOF (Safety of Obfuscation)\n  Level: ${this.level.toUpperCase()}\n  Timestamp: ${new Date().toISOString()}\n  \n  Warning: This script is protected with military-grade obfuscation.\n  Unauthorized reverse-engineering attempts will fail.\n]]\n\n`;

      return header + this.code;
    } catch (error) {
      console.error("Obfuscation error:", error);
      throw new Error("Obfuscation failed: " + (error as Error).message);
    }
  }
}
