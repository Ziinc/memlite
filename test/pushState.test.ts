import * as assert from "assert";
import Core, { App } from "../lib";

describe("state", function() {
  let core: App;
  it("calls pushState on init", async function() {
    var called = false;
    core = await Core.init({
      refreshCards: () => [],
      pushState: () => (called = true)
    });
    assert.equal(called, true);
  });
  it("calls pushState on handler call", async function() {
    let callCount = 0;
    core = await Core.init({
      refreshCards: () => [],
      pushState: () => (callCount += 1)
    });
    core.setState.resetViewer();
    assert.equal(callCount, 2);
  });
});
