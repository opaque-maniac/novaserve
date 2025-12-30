/**
 * @class VerbController - class to handle different HTTP verbs
 *
 * Extends BaseController and implements IVerbController
 *
 * @method handle - handle request based on HTTP verb
 *    @param req - request (NovaRequest)
 *    @param res - response (NovaResponse)
 *    @returns void
 *
 * @method GET - handle GET requests
 * @method POST - handle POST requests
 * @method PUT - handle PUT requests
 * @method PATCH - handle PATCH requests
 * @method DELETE - handle DELETE requests
 * @returns promise resolves to void
 */

import { IVerbController, VerbHandler } from "../../utils/types";
import BaseController from "./base-controller";
import type NovaRequest from "../request";
import type NovaResponse from "../response";

export default abstract class VerbController
  extends BaseController
  implements IVerbController
{
  GET?(req: NovaRequest, res: NovaResponse): Promise<void>;
  POST?(req: NovaRequest, res: NovaResponse): Promise<void>;
  PUT?(req: NovaRequest, res: NovaResponse): Promise<void>;
  PATCH?(req: NovaRequest, res: NovaResponse): Promise<void>;
  DELETE?(req: NovaRequest, res: NovaResponse): Promise<void>;

  constructor() {
    super();
  }

  async handle(req: NovaRequest, res: NovaResponse): Promise<void> {
    const handler = (this as any)[req.method] as VerbHandler | undefined;

    if (typeof handler === "function") {
      try {
        await handler(req, res);
      } catch (e) {
        res
          .status(500)
          .setHeader("Content-Type", "text/plain; charset=utf-8")
          .text("Internal Server Error");
      }
      return;
    }
    res
      .status(404)
      .setHeader("Content-Type", "text/plain; charset=utf-8")
      .text("Not found");
  }
}
