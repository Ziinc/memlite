import * as assert from "assert";
import Core from "../lib";
describe("internals", function () {
  it("a feature's schema is loaded", async function () {
    const core = await Core.init({}, { internals: true });
    const tables = core._internals.listTables();
    assert.ok(tables.includes("state"));
  });
});
