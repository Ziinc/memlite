import { App } from ".";
export default (core: App) => {
  return {
    // returns a list of tables within the database
    listTables() {
      const result = core._db.exec(`
      -- https://www.sqlitetutorial.net/sqlite-tutorial/sqlite-show-tables/
      SELECT 
          name
      FROM 
          sqlite_master 
      WHERE 
          type ='table' AND 
          name NOT LIKE 'sqlite_%';
    `);
      const [{ columns, values }] = result;
      return values.flat();
    },
  };
};
