import type NovaRequest from "./request";
import type NovaResponse from "./response";

export default class NovaMiddleware {
  async handle(req: NovaRequest, res: NovaResponse): Promise<void> {}
}
