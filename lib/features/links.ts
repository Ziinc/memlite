import Core from "../index";
import * as url from "url";
import * as path from "path";
import { Card } from "./cards";
import { setDeep } from "../utils";
export type Link = {
  fromCardId: number;
  fromCard: Card;
  toCardId: number;
  toCard: Card;
  anchorText: string;
};

type NoteLink = {
  toNoteId: string;
  altText: string;
  rootFilePath: string;
};
type MdLink = {
  altText: string;
  to: string;
};
export default function(core: any) {
  return {
    buildLinks() {
      let cards = Core.cards.listCards();
      if (cards.length == 0) return;
      let links = cards.reduce(
        (acc, card) => acc.concat(this.extractLinks(card)),
        []
      );
      if (links.length == 0) return;
      let base = "insert into links (toCardId, fromCardId, anchorText) values ";
      let [sql, values] = links.reduce(
        (acc, link, idx) => {
          return [
            (acc[0] += `${idx == 0 ? "" : ","} (?, ?, ?)`),
            acc[1].concat([link.toCardId, link.fromCardId, link.anchorText])
          ];
        },
        [base, []]
      );
      sql = sql + ";";
      core.db.run(sql, values);
    },
    extractLinks(card: Card) {
      let links = [];
      let match;
      const inlineRegexp = /\[([^\[]+)\]\(([^\)]+\w*)\)/g;
      const referenceRegexp = /\[([a-zA-z0-9_-]+)\]:\s*(\S+)/g;
      [inlineRegexp, referenceRegexp].forEach(regexp => {
        while ((match = regexp.exec(card.content))) {
          const toPath = match[2];

          //   resolve the path of the card, parse it and remove the .md ext
          let resolvedTo = path.resolve(card.parentDir, toPath);
          let parsed = path.parse(resolvedTo);
          parsed.base = path.basename(resolvedTo, ".md");
          let pathTo = path.format(parsed);

          const toCard = Core.cards.getCardFromPath(pathTo);
          links.push({
            fromCardId: card.id,
            toCardId: toCard.id,
            anchorText: match[1]
          });
        }
      });

      return links;
    },
    listInboundLinks(cardOrId) {
      let id;
      if (Number.isInteger(cardOrId)) {
        id = cardOrId;
      } else {
        id = cardOrId.id;
      }
      var res = core.db.exec(`${baseListQuery} where toCardId=? `, [id]);
      if (res.length == 0) {
        return [];
      }
      let [{ columns, values }] = res;
      return matrixToObjects(columns, values);
    },
    listOutboundLinks(cardOrId) {
      let id;
      if (Number.isInteger(cardOrId)) {
        id = cardOrId;
      } else {
        id = cardOrId.id;
      }
      var res = core.db.exec(`${baseListQuery} where fromCardId=?`, [id]);
      if (res.length == 0) {
        return [];
      }
      let [{ columns, values }] = res;
      return matrixToObjects(columns, values);
    }
  };
}

const baseListQuery = `
select links.anchorText, links.fromCardId, links.toCardId, 

toCards.id as 'toCard.id', 
toCards.parentDir as 'toCard.parentDir', 
toCards.filename as 'toCard.filename', 
toCards.basename as 'toCard.basename', 
toCards.content as 'toCard.content', 
toCards.rootFilePath as 'toCard.rootFilePath',

fromCards.id as 'fromCard.id', 
fromCards.parentDir as 'fromCard.parentDir', 
fromCards.filename as 'fromCard.filename', 
fromCards.basename as 'fromCard.basename', 
fromCards.content as 'fromCard.content', 
fromCards.rootFilePath as 'fromCard.rootFilePath' 
from links 
left join cards as toCards ON links.toCardId = toCards.id
left join cards as fromCards ON links.fromCardId = fromCards.id
`;

function matrixToObjects(columns, values) {
  values = values.map(row => {
    return columns.reduce((acc, col, idx) => {
      acc[col] = row[idx];
      return acc;
    }, {});
  });
  // convert nested dot keys to nested objects
  values = values.map(obj => buildNestedObjects(obj));
  return values;
}

// split dotkeys and set the value
function buildNestedObjects(obj) {
  let result = {};
  for (let [key, value] of Object.entries(obj)) {
    if (key.includes(".")) {
      // deep set the value
      const path = key.split(".");
      result = setDeep(result, path, value, true);
    } else {
      // do nothing
      result[key] = value;
    }
  }
  return result;
}
