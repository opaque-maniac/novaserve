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

import { createServer, Server } from "node:http";
import NovaRouter from "./router";
import NovaRequest from "./request";
import NovaResponse from "./response";

export default class NovaServe {
  private app: Server;
  private port: number = 3000;
  private router: NovaRouter | null = null;

  constructor() {
    this.app = createServer(async (req, res) => {
      if (!this.router) {
        throw new Error("Cannot process request when router is not mounted");
      }

      const _req = new NovaRequest(req);
      const _res = new NovaResponse();
      await this.router.handle(_req, _res);

      // TODO: Handle this better tomorrow
      if (!!_res.headers["Location"]) {
        while (true) {
          const redirect = _res.headers["Location"];
          if (typeof redirect === "string" && redirect) {
            _req.pathname = redirect;
          } else {
            break;
          }
        }
      }

      _res.send(res);
    });
  }

  use(router: NovaRouter) {
    this.router = router;
  }

  listen(port: number) {
    if (typeof port !== "number") {
      throw new Error("PORT number should be a string");
    }

    if (this.router === null) {
      throw new Error("Router is required to run app");
    }

    this.port = port;
    console.log(`Server is running on: http://localhost:${this.port}`);
    this.app.listen(port);
  }
}
