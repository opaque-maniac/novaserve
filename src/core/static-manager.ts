/**
 * StaticManager is responsible for serving static files from the "public" directory.
 *
 * @method handle - Handles the request for a static file.
 *     @param req - The incoming NovaRequest.
 *      @param res - The NovaResponse to send data back to the client.
 *      @returns A promise that resolves to a boolean indicating if the file was served.
 * 
 */
import type NovaRequest from "./request";
import type NovaResponse from "./response";
import { resolve, extname } from "node:path";
import { stat } from "node:fs/promises";
import process from "node:process";
import { getMimeType } from "../utils/mime";
import { FILE_MEMORY_THRESHOLD } from "../utils/constants";
import { createReadStream } from "node:fs";

export default class StaticManager {
  private staticPath: string;
  private staticDir: string;

  constructor() {
    this.staticPath = "public";
    this.staticDir = resolve(process.cwd(), this.staticPath);
  }

  async handle(req: NovaRequest, res: NovaResponse): Promise<boolean> {
    const safePath = resolve(this.staticDir, req.pathname);

    try {
      const fileStats = await stat(safePath);

      // No need to check dir
      if (fileStats.isDirectory()) return false;
      const mime = getMimeType(extname(safePath));

      if (fileStats.size > FILE_MEMORY_THRESHOLD) {
        res.stream(createReadStream(safePath), mime);
      } else {
        const { readFile } = await import("node:fs/promises");
        res.buffer(await readFile(safePath), mime);
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}
