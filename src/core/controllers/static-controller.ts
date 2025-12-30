/**
 * @class StaticController - class to serve static files
 *
 * @constant MEMORY_THRESHOLD - threshold to decide between streaming and buffering
 *
 * @method handle - handle request
 *      @param req - request (NovaRequest)
 *      @param res - response (NovaResponse)
 *      @returns void
 */

import path from "node:path";
import { access, stat, readFile } from "node:fs/promises";
import { constants, createReadStream } from "node:fs";
import BaseController from "./base-controller";
import type NovaRequest from "../request";
import type NovaResponse from "../response";

const MEMORY_THRESHOLD = 1024 * 1024; // 1MB

export default class StaticController extends BaseController {
  private filePath: string;

  constructor() {
    super();
    this.filePath = path.resolve(process.cwd(), "public");
  }

  async handle(req: NovaRequest, res: NovaResponse): Promise<void> {
    try {
      await access(this.filePath, constants.F_OK);

      const stats = await stat(this.filePath);

      const ext = path.extname(this.filePath).toLocaleLowerCase();
      const contentType = this.getContentType(ext);

      if (stats.size > MEMORY_THRESHOLD) {
        const stream = createReadStream(this.filePath);
        res.status(200).setHeader("Content-Type", contentType).stream(stream);
      } else {
        const data = await readFile(this.filePath);
        res.status(200).buffer(data, contentType);
      }
    } catch (e) {
      res
        .status(404)
        .setHeader("Content-Type", "text/plain; charset=utf-8")
        .text("Not Found");
    }
  }

  private getContentType(ext: string): string {
    const map: Record<string, string> = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".pdf": "application/pdf",
    };
    return map[ext] || "application/octet-stream";
  }
}
