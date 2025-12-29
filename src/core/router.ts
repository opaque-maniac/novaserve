import type { AllowedMethods, Controller, RouteLayer } from "../utils/types";
import type NovaMiddleware from "./middleware";
import type BaseController from "./controllers/base-controller";
import { pathToRegexp } from "path-to-regexp";
import NovaRequest from "./request";
import NovaResponse from "./response";

export default class NovaRouter {
  private layers: RouteLayer[] = [];

  useMiddleware(path: string, ...middleware: NovaMiddleware[]): void {
    const { regexp, keys } = pathToRegexp(path, { end: false });

    // All method is for middleware
    this.layers.push({
      method: "ALL",
      regExp: regexp,
      keys,
      middleware,
      handler: { handle: () => {} },
    });
  }

  register(
    method: AllowedMethods,
    path: string,
    handler: Controller | BaseController,
    middleware: NovaMiddleware[] = [],
  ): void {
    const isRouter = handler instanceof NovaRouter;
    const { regexp, keys } = pathToRegexp(path, { end: !isRouter });

    // All method is for middleware
    this.layers.push({
      method,
      regExp: regexp,
      keys,
      middleware,
      handler,
    });
  }

  async handle(req: NovaRequest, res: NovaResponse): Promise<void> {
    const originalPath = req.pathname;

    for (const layer of this.layers) {
      const match = layer.regExp.exec(originalPath);

      // no match or different method
      if (!match) continue;
      if (layer.method !== "ALL" && layer.method !== req.method) continue;

      const params: Record<string, string> = {};

      layer.keys.forEach((key, i) => {
        params[key.name] = match[i + 1];
      });

      req.params = { ...req.params, ...params };

      // middlware execution
      for (const middlware of layer.middleware) {
        await middlware.handle(req, res);
        if (res.responseData !== null) return;
      }

      await layer.handler.handle(req, res);

      // Request finished
      if (!(layer.handler instanceof NovaRouter)) return;
      if (res.responseData !== null) return;
    }

    if (res.responseData == null) {
      res.status(404).text("Not found");
    }
  }
}
