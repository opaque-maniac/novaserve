import type { Key } from "path-to-regexp";
import type NovaMiddleware from "../core/middleware";
import type BaseController from "../core/controllers/base-controller";
import NovaRequest from "../core/request";
import NovaResponse from "../core/response";

/**
 * This is a file for all types defined outside of class code
 *
 * All types here can be exported
 */

// Configs for the app
export type NovaConfigs = {
  logActivity: boolean;
  maxBodySize: number;
};

// Files uploaded from req (IncommingMessage -> node:http)
export interface File {
  filename: string;
  mime: string;
  buffer: Buffer;
}

// methods for HTTP
export type AllowedMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Type for controllers
// Fallback for when registering middleware
export interface Controller {
  handle(req: NovaRequest, res: NovaResponse): Promise<void> | void;
}

// For routes in router
export interface RouteLayer {
  method: AllowedMethods | "ALL";
  regExp: RegExp;
  keys: Key[];
  middleware: NovaMiddleware[];
  handler: BaseController | Controller;
}

// Verb handler
export type VerbHandler = (
  req: NovaRequest,
  res: NovaResponse,
) => Promise<void>;

// Verb controller
export interface IVerbController {
  GET?: VerbHandler;
  POST?: VerbHandler;
  PUT?: VerbHandler;
  PATCH?: VerbHandler;
  DELETE?: VerbHandler;
}
