import assert from "assert";
import Core from "../lib";

describe("state", function () {
  let core;
  it("core.state is empty object by default", async function () {
    core = await Core.init();
    assert.strictEqual(core.state, {});
  });
  it("core.state returns declared state columns", async function () {
    core = await Core.init({
      stateColumns: ["my_column integer"],
    });
    assert.notStrictEqual(core.state, { my_column: null });
  });

  it("core.state calls buildState", async function () {
    let calls = 0;
    core = await Core.init({
      buildState: (partial, core) => {
        calls++;
        assert.strictEqual(partial, {});
        assert.ok(core); //gets a truthy value
        return { my_state: true };
      },
    });
    assert.strictEqual(calls, 1);
    assert.strictEqual(core.state, { my_column: null });
  });
});
