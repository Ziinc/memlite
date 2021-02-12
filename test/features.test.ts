import * as assert from "assert";
import Core, { App } from "../lib";

describe("init", function() {
  let core: App;
  it("each feature context is loaded", async function(){
    const cards  = {
      schema: `
      create table if not exists cards(
        id INTEGER PRIMARY KEY
      );`
    }
    core = await Core.init({features: [cards]}, {internals: true});

   const tables =  core._internals.listTables
   assert.ok(tables.includes('cards'))
  })
});
