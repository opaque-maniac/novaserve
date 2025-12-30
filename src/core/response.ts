/**
 * @class NovaResponse - Response class to get data for how to respond to a request
 *
 * @method status - register status code for response
 *    @param code - status code to send back, default 200 OK
 *    @returns response instance
 *
 * @method json - send json response
 *    @param data - data to stringify if valid json
 *    @returns response instance
 *
 * @method text - send text response
 *    @param data - string data to send as response
 *    @returns response instance
 *
 * @method stream - send stream response
 *    @param data - Readable stream data to send as response
 *    @param contentType - content type of the stream, default application/octet-stream
 *    @returns response instance
 *
 * @method buffer - send buffer response
 *    @param data - Readable stream data to send as response
 *    @param contentType - content type of the stream, default application/octet-stream
 *    @returns response instance
 *
 * @method redirect - send redirect response
 *    @param pathname - path to redirect to
 *    @param status - status code to send back, default 302 Found
 *    @returns response instance
 *
 * @method setHeader - to send headers for response
 *    @param key - header key to set
 *    @param value - header value to set
 *    @returns response instance
 *
 * @method send - to move data from my class to SuccessMessage
 *    @param res - ServerResponse object to send data to
 *    @returns response instance
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
    return this;
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
