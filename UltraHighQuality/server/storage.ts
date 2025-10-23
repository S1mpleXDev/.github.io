import { type InsertScript, type Script } from "@shared/schema";
import { randomBytes } from "crypto";

export interface IStorage {
  // Script management
  createScript(script: InsertScript): Promise<Script>;
  getScript(id: string): Promise<Script | undefined>;
  getAllScripts(): Promise<Script[]>;
  deleteScript(id: string): Promise<boolean>;
  incrementAccessCount(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private scripts: Map<string, Script>;

  constructor() {
    this.scripts = new Map();
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const id = randomBytes(16).toString("hex");
    const script: Script = {
      ...insertScript,
      id,
      createdAt: new Date(),
    };
    this.scripts.set(id, script);
    return script;
  }

  async getScript(id: string): Promise<Script | undefined> {
    return this.scripts.get(id);
  }

  async getAllScripts(): Promise<Script[]> {
    return Array.from(this.scripts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteScript(id: string): Promise<boolean> {
    return this.scripts.delete(id);
  }

  async incrementAccessCount(id: string): Promise<void> {
    const script = this.scripts.get(id);
    if (script) {
      script.accessCount++;
      this.scripts.set(id, script);
    }
  }
}

export const storage = new MemStorage();
