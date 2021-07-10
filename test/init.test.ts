import * as assert from "assert";
import Core, { App } from "../lib";

describe("init", function () {
  let core: App;
  beforeEach(function(){
    core = null
  })
  it("before initialization, no other keys are set", async function () {
    assert.ok("init" in Core);
    assert.ok("state" in Core === false);
    assert.ok("_db" in Core === false);
    core = await Core.init();
    assert.ok("init" in core);
    // state and _db is not a getter key
    assert.ok("_db" in core === false);
    assert.ok("state" in core === false);
  });
  it("adds access to _internals when internals option is true", async function () {
    core = await Core.init({}, { internals: true });
    assert.ok(Object.keys(core._internals).length >= 0);
  });

  it("can init with an wasm file location", async function(){
    core = await Core.init({
      wasmFile: "../sql.wasm"
    });
    console.log(core.state)
    assert.ok("init" in core);
    assert.ok("state" in core === false);
  })
});
