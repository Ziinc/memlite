import * as assert from "assert";
import Core from "../lib";

describe("features", function () {
  it("namespace is required", async function () {
    assert.rejects(Core.init({ features: [{}] }));
  });
  it("a feature's schema is loaded", async function () {
    const cards = {
      namespace: "cards",
      schema: `
      create table if not exists cards(
        id INTEGER PRIMARY KEY
      );`,
    };
    const core = await Core.init({ features: [cards] }, { internals: true });

    const tables = core._internals.listTables();
    assert.ok(tables.includes("cards"));
  });
  it("a feature's context can be declared", async function () {
    const cards = {
      namespace: "cards",
      schema: `
      create table if not exists cards(
        id INTEGER PRIMARY KEY
      );`,
      context: (v) => ({
        myHandler: () => {
          assert.ok(v);
          return "myHandler";
        },
      }),
    };
    try {
      const core = await Core.init({ features: [cards] });
      const result = core.cards.myHandler();
      assert.strictEqual(result, "myHandler");
    } catch (err) {
      console.error(err);
    }
  });
});
