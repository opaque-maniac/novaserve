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

import BaseController from "./base-controller";
import NovaRequest from "../request";
import type NovaResponse from "../response";
import StaticManager from "../static-manager";

export default class StaticController extends BaseController {
  private filePath: string;
  private manager: StaticManager;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
    this.manager = new StaticManager();
  }

  async handle(req: NovaRequest, res: NovaResponse): Promise<void> {
    const _req = new NovaRequest(req.raw);
    _req.pathname = this.filePath;
    const handled = await this.manager.handle(_req, res);

    if (!handled) {
      res.status(404).text("File not found");
    }
  }
}
