/**
 * @class NovaMiddleware - class to extend for middleware
 *
 * @method handle - handle requests for users
 */
import type { IMiddleware } from "../utils/types";
import type NovaRequest from "./request";
import type NovaResponse from "./response";

export default abstract class NovaMiddleware implements IMiddleware {
  abstract handle(req: NovaRequest, res: NovaResponse): Promise<void>;

  protected fail(res: NovaResponse, code = 400, msg = "Bad Request") {
    res
      .status(code)
      .setHeader("Content-Type", "text/plain; charset=utf-8")
      .text(msg);
  }
}
