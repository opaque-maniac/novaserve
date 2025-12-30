import { IVerbController, VerbHandler } from "../../utils/types";
import NovaRequest from "../request";
import NovaResponse from "../response";
import BaseController from "./base-controller";

export default abstract class VerbController
  extends BaseController
  implements IVerbController
{
  // Methods that are allowed
  // For auto complete in subclasses
  // TODO: Fix inheritance issue tomorrow
  abstract GET?(req: NovaRequest, res: NovaResponse): Promise<void>;
  abstract POST?(req: NovaRequest, res: NovaResponse): Promise<void>;
  abstract PUT?(req: NovaRequest, res: NovaResponse): Promise<void>;
  abstract PATCH?(req: NovaRequest, res: NovaResponse): Promise<void>;
  abstract DELETE?(req: NovaRequest, res: NovaResponse): Promise<void>;

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
