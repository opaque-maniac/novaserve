import type { NovaConfigs } from "./types";

export const defaultConfigs: NovaConfigs = {
  logActivity: true,
  maxBodySize: 10 * 1024 * 1024,
};

export const FILE_MEMORY_THRESHOLD = 1024 * 1024; // 1MB
