import * as assert from "assert";
import Core from "../lib";

describe("state", function () {
  it("core.state is empty object by default", async function () {
    const core = await Core.init();
    assert.notStrictEqual(core.state, {});
  });
  it("core.state returns declared state columns as functions", async function () {
    const core = await Core.init({
      stateColumns: ["my_column integer default 123"],
    });
    assert.ok(typeof core.state.my_column === "function")
    assert.strictEqual(core.state.my_column(), 123);
  });

  it("core.state calls buildState", async function () {
    let calls = 0;
    const core = await Core.init({
      stateColumns: ["my_column integer default 2"],
      buildState: (partial, core) => {
        calls++;
        assert.ok(typeof partial.my_column === "function")
        assert.strictEqual(partial.my_column(), 2);
        assert.ok(core); //gets a truthy value
        return { my_state: true };
      },
    });
    assert.strictEqual(core.state.my_state, true);
    assert.strictEqual(calls, 1);
  });
});
