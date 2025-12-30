/**
 * @class BaseController - base class to handle requests
 *
 * @method handle - handle request
 *      @param req - request (NovaRequest)
 *      @param res - response (NovaResponse)
 *      @returns void
 */

import type NovaRequest from "../request";
import type NovaResponse from "../response";

export default abstract class BaseController {
  async handle(req: NovaRequest, res: NovaResponse): Promise<void> {
    res
      .status(501)
      .setHeader("Content-Type", "text/plain; charset=utf-8")
      .text("Not Implemented");
  }
}
