import initSqlJs from "sql.js";
import Cards, { RawCard, Card } from "./features/cards";
import Links, { Link } from "./features/links";
import utils from "./utils";
import setState, { SetState } from "./setState";
interface Deps {
  refreshCards: () => RawCard[];
  pushState?: (state: State) => void;
  createFile?: (card: Card) => void
}
export type State = {
  viewingId: number;
  viewing: {
    card: Card;
    inboundLinks: Link[];
    outboundLinks: Link[];
  } | null;
};
export type App = {
  db: any;
  refresh: any;
  deps: Deps;
  cards: any;
  init: Promise<App>;
  setState: SetState;
  state: State;
};

export default {
  async init(deps: Deps) {
    this.deps = deps;
    return initSqlJs()
      .then((SQL: any): any => new SQL.Database())
      .then(db => {
        // update the schema
        this.db = db;
        // TODO breakup schemas to individual feature files
        let sqlstr = `
        create table if not exists cards(
          id integer primary key,
          parentDir text,
          filename text,
          basename text,
          content text,
          rootFilePath text
        );
        create table if not exists links(
          toCardId integer references cards(id),
          fromCardId integer references cards(id),
          anchorText text
        );
        create table if not exists state(
          id INTEGER PRIMARY KEY,
          viewingId integer references cards(id)
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
      .then((app: App) => {
        app.refresh();
        return this;
      });
  },
  refresh() {
    let cards;

    if (this.deps.refreshCards) {
      cards = this.deps.refreshCards();
      this.cards.insertCards(cards);
      this.links.buildLinks();
    }
    if (this.deps.pushState) {
      this.deps.pushState(this.state);
    }
  },
  get cards() {
    return Cards(this);
  },
  get links() {
    return Links(this);
  },
  get setState() {
    return setState(this);
  },
  get state() {
    let sql = this.db.prepare(`select * from state;`);
    const partialState = sql.getAsObject([]);
    const full = {
      ...partialState,
      viewing: !partialState.viewingId
        ? null
        : {
          card: this.cards.getCard(partialState.viewingId),
          inboundLinks: this.links.listInboundLinks(partialState.viewingId),
          outboundLinks: this.links.listOutboundLinks(partialState.viewingId)
        }
    };
    return full;
  },
  utils
};
