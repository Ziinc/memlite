import assert from "assert";
import Core from "../lib";

describe("features", function () {
  let core;
  it("a feature's schema is loaded", async function () {
    const cards = {
      schema: `
      create table if not exists cards(
        id INTEGER PRIMARY KEY
      );`,
    };
    core = await Core.init({ features: [cards] }, { internals: true });

    const tables = core._internals.listTables;
    assert.ok(tables.includes("cards"));
  });
  it("a feature's handlers can be declared", async function () {
    const cards = {
      schema: `
      create table if not exists cards(
        id INTEGER PRIMARY KEY
      );`,
      handlers: {
        myHandler: (handlerArg) => {
          assert.ok(handlerArg);
          return "myHandler";
        },
      },
    };
    core = await Core.init({ features: { cards } });
    const result = core.cards.myhandler();
    assert.strictEqual(result, "myHandler");
  });
});
