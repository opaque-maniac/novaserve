/**
 * @class NovaRequest - Request class to construct form nodejs IncomingMessage
 *
 * @constructor
 *    @param msg - IncommingMessage (req) from nodejs
 *    @param maxBodySize - maximum size a req.body should be
 *
 * @method readBody - reads stream of req.body from IncomingMessage
 *    @returns a buffer containing data if any and empty if not
 *
 * @method json - read req.body if it json and throws an error if unable to parse json
 *    @returns parsed json typed generically as T
 */

import { IncomingMessage } from "node:http";

export default class NovaRequest {
  public raw: IncomingMessage;
  public body: Buffer | null = null;
  public headers: Headers;
  public url: URL;
  // For router logic
  public _pathname: string;

  // Normally used by consumer
  public pathname: string;
  public searchParams: URLSearchParams;
  public method: string = "GET";
  public params: Record<string, string> = {};
  private MAX_BODY_SIZE: number;

  constructor(msg: IncomingMessage, maxBodySize: number) {
    if (!(msg instanceof IncomingMessage)) {
      throw new Error(
        "Request requires an instance of IncomingMessage in constructor",
      );
    }

    if (typeof maxBodySize !== "number") {
      throw new Error(
        "Request requeres MAX_BODY_SIZE value of type 'number' to select threshold",
      );
    }

    this.raw = msg;
    this.method = msg.method?.toUpperCase() || "GET";
    this.url = new URL(msg.url || "/", "http://localhost");
    this._pathname = this.url.pathname;
    this.pathname = this.url.pathname;
    this.searchParams = this.url.searchParams;
    this.headers = new Headers();

    for (const [k, v] of Object.entries(msg.headers)) {
      if (Array.isArray(v)) {
        v.forEach((val) => {
          if (val) this.headers.append(k, val);
        });
      } else if (v) {
        this.headers.append(k, v);
      }
    }

    this.MAX_BODY_SIZE = maxBodySize;
  }

  async readBody(): Promise<Buffer> {
    if (this.body) return this.body;

    const chunks: Buffer[] = [];
    let size = 0;

    return new Promise<Buffer>((resolve, reject) => {
      this.raw.on("data", (chunk: Buffer) => {
        size += chunk.length;

        if (size > this.MAX_BODY_SIZE) {
          reject(new Error("401: Body exceeds limit of 10MB"));
          this.raw.destroy();
          return;
        }

        chunks.push(chunk);
      });

      this.raw.on("end", () => {
        this.body = Buffer.concat(chunks);
        resolve(this.body);
      });

      this.raw.on("error", (e) => reject(e));
    });
  }

  async json<T>(): Promise<T> {
    const body = await this.readBody();
    if (body.length === 0) return {} as T;

    try {
      return JSON.parse(body.toString()) as T;
    } catch (e) {
      throw new Error("400: Invalid JSON body");
    }
  }
}
