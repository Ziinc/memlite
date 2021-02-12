import * as assert from "assert";
import Core, { App } from "../lib";

describe("init", function() {
  let core: App;
  it("core contains critical keys", async function() {
    core = await Core.init();
    assert.ok('init' in core);
    assert.ok('state' in core);
    assert.ok('pushState' in core);
    assert.ok('setState' in core);
  });
  it("core adds an _internals key when internals option is true", async function() {
    core = await Core.init({}, {internals: true});
    assert.ok('_internals' in core);
  });
});
