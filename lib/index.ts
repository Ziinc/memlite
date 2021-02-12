import initSqlJs from "sql.js";
export type App = {
  init: (initArgs, Options) => Promise<App>;
  state: Object;
  db: Object;
  _internals?: Internals;
};
type initArgs = {
  features: Object;
  stateColumns: string[];
  buildState: (App) => Object;
};
type Options = {
  internals: boolean;
};
type Internals = {
  listTables: () => string[];
};
export default {
  async init(args, opts: Options = { internals: false }) {
    if (opts?.internals == true) {
      // set the _internals key
      this._internals = {};
    }

    return initSqlJs()
      .then((SQL: any): any => new SQL.Database())
      .then((db) => {
        // update the schema
        this.db = db;
        const stateCols = ["id integer primary key"].concat(
          args?.stateColumns || []
        );
        let sqlstr = `
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
      });
  },
  // get cards() {
  //   return Cards(this);
  // },
  // get links() {
  //   return Links(this);
  // },
  get state() {
    let sql = this.db.prepare(`select * from state;`);
    const partialState = sql.getAsObject([]);
    delete partialState.id;
    const full = {
      ...partialState,
    };
    return full;
  },
} as App;
