/**
 * NovaFormData - custom FormData class for NovaRequest class
 *  @param req - NovaRequest instance that consumes the class
 *             - This is to share a method to read the request body in NovaRequest
 * @method get
 *    @param field - name of formData field
 *    @returns - field value if any, undefined if none
 * 
 * @method getFiles
 *    @param field - name of formData input field with file
 *    @returns - Array of files (utils/types.ts), and empty one if none are available
 * 
 * @method parse - parses formData, different types based on request header
 *    @returns void
 * 
 * @method #parseMultipart - parses multipart and updated the parsedFields and parsedFiles record
 *    @return void
 */

import busboy from "busboy";
import { Readable } from "node:stream";
import NovaRequest from "./request";
import type { File } from "../utils/types";

export default class NovaFormData {
  private req: NovaRequest;
  private parsedFields: Record<string, any> = {};
  private parsedFiles: Record<string, File[]> = {};
  private isParsed = false;

  constructor(req: NovaRequest) {
    this.req = req;
  }

  async get(field: string) {
    await this.parse();
    return this.parsedFields[field] || null;
  }

  async getFiles(field?: string): Promise<File[]> {
    await this.parse();
    if (field) return this.parsedFiles[field] ?? [];
    return Object.values(this.parsedFiles).flat();
  }

  private async parse() {
    if (this.isParsed) return;

    const contentType = this.req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      await this.#parseMultipart();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await this.req.readBody();
      const params = new URLSearchParams(body.toString());
      this.parsedFields = Object.fromEntries(params.entries());
    }

    this.isParsed = true;
  }

  async #parseMultipart(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const headersObj: Record<string, string> = {};
      this.req.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      const bb = busboy({ headers: headersObj });

      bb.on("field", (name, val) => {
        this.parsedFields[name] = val;
      });

      bb.on("file", (name, file, info) => {
        const { filename, mimeType } = info;
        const chunks: Buffer[] = [];

        file.on("data", (data) => chunks.push(data));
        file.on("end", () => {
          if (!this.parsedFiles[name]) this.parsedFiles[name] = [];
          this.parsedFiles[name].push({
            filename,
            mime: mimeType,
            buffer: Buffer.concat(chunks),
          });
        });
      });

      bb.on("close", resolve);
      bb.on("error", reject);

      // IMPROVEMENT: Handling the "Already Read" scenario.
      // If req.readBody() was called first, the raw stream is empty.
      // We must pipe from the cached Buffer instead.
      if (this.req.body) {
        Readable.from(this.req.body).pipe(bb);
      } else {
        this.req.raw.pipe(bb);
      }
    });
  }
}
