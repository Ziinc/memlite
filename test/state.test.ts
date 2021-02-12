import * as assert from "assert";
import Core, { App } from "../lib";

describe("state", function() {
  let core: App;
  it("core.state returns current client state", async function() {
    core = await Core.init({ refreshCards: () => [] });
    assert.notStrictEqual(core.state, {
      viewingId: null,
      viewing: null
    });
  });
});
