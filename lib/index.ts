import initSqlJs from "sql.js/dist/sql-wasm.js";
import internals from "./internals";
export type App = {
  init: (initArgs?, Options?) => Promise<App>;
  state: Object;
  _db: any;
  _internals?: Internals;
  [k: string]: ContextResult | any;
};
type initArgs = {
  wasmFile?: string;
  features: Feature[];
  stateColumns: string[];
  buildState: (Object, App) => Object;
};
type Options = {
  internals: boolean;
};
type Internals = {
  listTables: () => string[];
};
type Feature = {
  namespace: string;
  schema: string;
  context: Context;
};
type Context = (App) => ContextResult;
type ContextResult = {
  [key: string]: Function;
};
export default {
  async init(args: initArgs, opts: Options) {
    args = Object.assign(
      { features: [], stateColumns: [], buildState: (v) => v },
      args || {}
    );
    opts = Object.assign({ internals: false }, opts || {});

    // build features
    let schemas = args.features.map((f) => f.schema);
    let featureContexts = args.features.reduce((acc, f) => {
      if (!f.namespace) {
        throw new Error("A namespace is required for feature declarations");
      }
      acc[f.namespace] = f.context;
      return acc;
    }, {});
    return initSqlJs({
      locateFile: args?.wasmFile ? () => args?.wasmFile : undefined,
    })
      .then((SQL: any): any => new SQL.Database())
      .then((db) => {
        // update the schema
        const stateCols = ["id integer primary key"].concat(args.stateColumns);
        let sqlstr = `
        ${schemas.join("\n")}

        create table if not exists state(
          ${stateCols.join(",")}
        );

        --https://stackoverflow.com/questions/33104101/ensure-sqlite-table-only-has-one-row
        --limit only one row with sqlite
        CREATE TRIGGER state_no_insert
        BEFORE INSERT ON state
        WHEN (SELECT COUNT(*) FROM state) >= 1
        BEGIN
            SELECT RAISE(FAIL, 'only one state row permitted');
        END;

        INSERT INTO state DEFAULT VALUES;
        `;

        db.run(sqlstr);
        return db;
      })
      .then((db) => {
        // return the final core object as a proxy
        const proxy = new Proxy(this, {
          get(target, name: string, receiver) {
            // db is being accessed
            if (name === "_db") return db;

            // state is being accessed
            if (name === "state") {
              let sql = receiver._db.prepare(`select * from state;`);
              const partialState = sql.getAsObject([]);
              delete partialState.id;

              return args.buildState(partialState, receiver);
            }

            // one of the features
            if (name in featureContexts && featureContexts[name]) {
              return featureContexts[name](receiver);
            }

            // set the _internals key
            if (opts.internals === true && name === "_internals") {
              return internals(receiver);
            }

            return Reflect.get(target, name, receiver);;
          },
        });

        return proxy;
      });
  },
} as App;
