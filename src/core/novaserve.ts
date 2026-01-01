/**
 * @class NovaServe - main class for library
 *
 * @method use - registers a router as main router
 *    @param router - router (NovaRouter) to use
 *    @returns void
 *
 * @method listen - server listen for requests
 *    @param port - port to listen on
 *    @returns void
 */

import type { NovaConfigs } from "../utils/types";
import { createServer, Server } from "node:http";
import { extname } from "node:path";
import NovaRouter from "./router";
import NovaRequest from "./request";
import NovaResponse from "./response";
import { defaultConfigs } from "../utils/constants";
import StaticManager from "./static-manager";

export default class NovaServe {
  private app: Server;
  private port: number = 3000;
  private router: NovaRouter | null = null;
  private configs: NovaConfigs;
  private staticManager: StaticManager;

  constructor(configs: Partial<NovaConfigs> = defaultConfigs) {
    this.configs = { ...defaultConfigs, ...configs };
    this.staticManager = new StaticManager();

    this.app = createServer(async (req, res) => {
      try {
        if (!this.router) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Router not mounted");
          return;
        }

        const _req = new NovaRequest(req, this.configs.maxBodySize);
        const _res = new NovaResponse();

        // Logging Request
        if (this.configs.logActivity) {
          console.log(`[Nova] ${_req.method} ${_req.pathname}`);
        }

        const hasExtension = !!extname(_req.pathname);
        let handledByStatic: boolean = false;

        if (hasExtension) {
          handledByStatic = await this.staticManager.handle(_req, _res);
        }

        if (!handledByStatic) {
          if (!this.router) {
            if (this.configs.logActivity) {
              console.log(`[Nova] ${_res.status}`);
            }

            res.writeHead(500, "", {
              "content-type": "text/plain; charset=utf-8",
            });
            res.end("Router not mounted");
            return;
          }

          await this.router.handle(_req, _res);
        }

        if (_res.responseData === null && !_res.headers["Location"]) {
          _res.status(404).text("Not found");
        }

        // Loggin Response
        if (this.configs.logActivity) {
          const redirectPath = _res.headers["Location"];
          console.log(
            `[Nova] ${_res.status} ${
              redirectPath ? `Redirect ${redirectPath}` : ""
            }`,
          );
        }

        _res.send(res);
      } catch (err) {
        console.log("[Nova Runtime Error]:", err);
        if (!res.writableEnded) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      }
    });
  }

  use(router: NovaRouter) {
    this.router = router;
  }

  listen(port: number, callback?: () => void) {
    if (typeof port !== "number") {
      throw new Error("PORT should be a number");
    }

    if (callback && typeof callback !== "function") {
      throw new Error("Callback should be a function");
    }

    if (this.router === null) {
      throw new Error("Router should be mounted in order to run app");
    }

    this.port = port;
    this.app.listen(this.port, () => {
      if (callback) {
        callback();
      } else {
        console.log(`Server is running on: http://localhost:${this.port}`);
      }
    });
  }
}
