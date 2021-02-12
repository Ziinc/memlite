
export interface SetState {
  viewCard: (id: number) => void;
  resetViewer: () => void;
}

export default function (core: any): SetState {
  const handlers = {
    viewCard(id: number) {
      // update state table
      let sql = core.db.prepare("update state set viewingId=?;");
      sql.run([id]);
    },
    resetViewer() {
      core.db.run("update state set viewingId=null");
    }
  };

  // for every handler declared, wrap the handler in a function that calls core.deps.pushState
  // pushes state to the client
  let wrapped;
  wrapped = {};
  for (const prop in handlers) {
    wrapped[prop] = args => {
      handlers[prop](args);
      if (core.deps.pushState) {
        core.deps.pushState(core.state);
      }
    };
  }

  return wrapped;
}
