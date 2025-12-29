/**
 * NovaResponse - class 
 */
import { ServerResponse } from "node:http";
import { Readable } from "node:stream";

export default class NovaResponse {
  public _status: number = 200;
  public headers: Record<string, string | string[]> = {};
  public responseData: string | Buffer | Readable | null = null;

  status(code: number) {
    this._status = code;
    return this;
  }

  json(data: any) {
    this.headers["Content-Type"] = "application/json";
    this.responseData = JSON.stringify(data);
    return this;
  }

  text(data: string) {
    this.headers["Content-Type"] = "text/plain; charset=utf-8";
    this.responseData = data;
    return this;
  }

  stream(data: Readable, contentType: string = "application/octet-stream") {
    this.headers["Content-Type"] = contentType;
    this.responseData = data;
    return this;
  }

  buffer(data: Readable, contentType: string = "application/octet-stream") {
    this.headers["Content-Type"] = contentType;
    this.responseData = data;
    return this;
  }

  redirect(pathname: string, status: number = 302) {
    this._status = status;
    this.headers["Location"] = pathname;
    this.responseData = null;
    return this;
  }

  setHeader(key: string, value: string | string[]) {
    this.headers[key] = value;
  }

  send(res: ServerResponse) {
    res.writeHead(this._status, this.headers);

    // Improvement
    if (this.responseData instanceof Readable) {
      this.responseData.pipe(res);
    } else {
      res.end(this.responseData);
    }
  }
}
