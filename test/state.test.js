import * as assert from "assert";
import Core from "../lib";

describe("state", function () {
  it("core.state is empty object by default", async function () {
    const core = await Core.init();
    assert.notStrictEqual(core.state, {});
  });
  it("core.state returns declared state columns", async function () {
    const core = await Core.init({
      stateColumns: ["my_column integer"],
    });
    assert.notStrictEqual(core.state, { my_column: null });
  });

  it("core.state calls buildState", async function () {
    let calls = 0;
    const core = await Core.init({
      buildState: (partial, core) => {
        calls++;
        assert.notStrictEqual(partial, {});
        assert.ok(core); //gets a truthy value
        return { my_state: true };
      },
    });
    assert.notStrictEqual(core.state, { my_column: null });
    assert.strictEqual(calls, 1);
  });
});
