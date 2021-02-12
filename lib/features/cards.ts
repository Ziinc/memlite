import * as path from "path";
export interface RawCard {
  id: number;
  parentDir: string;
  filename: string;
  content: string;
}
export interface Card {
  id: number;
  parentDir: string;
  filename: string;
  basename: string;
  content: string;
  rootFilePath: string;
}
export default function (core: any) {
  return {
    listCards(): Card[] {
      var res = core.db.exec("SELECT * FROM cards;");
      if (res.length == 0) {
        return [];
      }
      let [{ columns, values }] = res;
      // convert array of arrays to array of objects
      values = values.map(row => {
        return columns.reduce((acc, col, idx) => {
          acc[col] = row[idx];
          return acc;
        }, {});
      });
      return values;
    },
    insertCards(cards: RawCard[]) {
      if (cards.length == 0) return;
      let base =
        "insert into cards (id, parentDir, filename, basename, content, rootFilePath) values ";
      let [sql, values] = cards.reduce(
        (acc, card, idx) => {
          let rootFilePath = path.join(
            card.parentDir,
            path.basename(card.filename, ".md")
          );

          return [
            (acc[0] += `${idx == 0 ? "" : ","} (?, ?, ?, ?, ?, ?)`),
            acc[1].concat([
              card.id,
              card.parentDir,
              card.filename,
              path.basename(card.filename, ".md"),
              card.content,
              rootFilePath
            ])
          ];
        },
        [base, []]
      );
      core.db.run(sql, values);
    },
    // creates a single card
    /**
     * Creates a single card. Calls the `createFile` dep.
     * @param card 
     */
    createCard(card: RawCard = { id: core.utils.newId(), parentDir: "/inbox", filename: "untitled_card", content: "" }) {

      core.db.run(`insert into cards (id, parentDir, filename, content)
      values (?, ?, ?, ?);
      `, [card.id, card.parentDir, card.filename, card.content]);
      const newCard = this.getCard(card.id)
      core.deps.createFile(newCard)
      return newCard
    },
    getCard(id: number) {
      var sql = core.db.prepare(`SELECT c.* , l.*  FROM cards c
      left join links l on l.fromCardId = c.id
      WHERE c.id=?
      `);
      const res = sql.getAsObject([id]);
      return res;
    },
    getCardFromPath(cardPath: string): Card {
      var sql = core.db.prepare("SELECT * FROM cards WHERE rootFilePath=?");
      return sql.getAsObject([cardPath]);
    }
  };
}
