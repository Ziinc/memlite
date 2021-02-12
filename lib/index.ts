import initSqlJs from "sql.js";
export type App = {
  init: (initArgs, Options) => Promise<App>;
  state: Object;
  db: Object;
  _internals?: Internals;
};
type initArgs = {
  features: Feature[];
  stateColumns: string[];
  buildState: (App) => Object;
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
type Context = (
  App
) => {
  [key: string]: Function;
};
export default {
  async init(args, opts: Options = { internals: false }) {
    if (opts?.internals == true) {
      // set the _internals key
      this._internals = {};
    }

    // build features
    let schemas = args.features.map((f) => f.schema);
    let featureKeys = args.features.map((f) => f.namespace);
    let features = args.features.reduce(
      (acc, f) => (acc[f.namespace] = f.context),
      {}
    );
    return initSqlJs()
      .then((SQL: any): any => new SQL.Database())
      .then((db) => {
        // update the schema
        this.db = db;
        const stateCols = ["id integer primary key"].concat(
          args?.stateColumns || []
        );
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

        this.db.run(sqlstr);
        return this;
      })
      .then((core) => {
        // return the final core object as a proxy
        const proxy = new Proxy(core, {
          get(target, name: string, receiver) {
            let rv = Reflect.get(target, name, receiver);

            // state is being accessed
            if (name === "state") {
              let sql = this.db.prepare(`select * from state;`);
              const partialState = sql.getAsObject([]);
              delete partialState.id;

              const buildState = args?.buildState || ((v) => v);
              return buildState(partialState, receiver);
            }

            // one of the features
            if (name in features) {
              return features[name](receiver);
            }
            return rv;
          },
        });

        return proxy;
      });
  },
} as App;
