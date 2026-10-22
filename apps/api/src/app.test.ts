import { describe, expect, it } from "@jest/globals";
import { app } from "./app.js";

describe("CodeArena API", () => {
  it("exposes a health endpoint", async () => {
    const server = app.listen(0);
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("No test server address");
      const response = await fetch(`http://127.0.0.1:${address.port}/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "ok" });
    } finally { server.close(); }
  });
});
