import * as assert from "assert";
import Core, { App } from "../lib";

describe("init", function () {
  let core: App;
  it("before initialization, no other keys are set", async function () {
    assert.ok("init" in Core);
    assert.rejects("state" in Core);
    core = await Core.init();
    assert.ok("state" in core);
    assert.ok("init" in core);
  });
  it("adds access to _internals when internals option is true", async function () {
    core = await Core.init({}, { internals: true });
    assert.ok("_internals" in core);
  });
});
