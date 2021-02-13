# Memlite

Memlite is a SQLite state management library. It can be used to create, manage, and manipulate a state tree.

**WARNING UNRELEASED AND UNSTABLE**

## Features

- Platform/framework agnostic.
- SQL state management (using SQLite).

## Quickstart

```js
// initialize the core
import memlite from 'memlite'

const context = core => ({
  set(input){
    let sql = core._db.prepare("UPDATE state set hello=?;");
    sql.run([input]);
  },
  clear(){
    core._db.run("UPDATE state SET hello=null");
  }
})

// initialize the core of the application
let core = memlite.init({
  stateColumns: ["hello text"],
  features: [{ namespace: "quickstart", context: context }]
)

// access the state table
console.log(core.state) // {hello: null}
core.quickstart.set("world")
console.log(core.state) // {hello: "world"}
core.quickstart.clear()
console.log(core.state) // {hello: null}
```

## Documentation

### Initialization

When initializing the core, you can provide the following options:

1. **stateColumns**: a list of sql columns to be added to the `state` table.
2. **features**: refer to the **Features** section
3. **buildState**: a function that receives the current state table as an object, and manipulates and returns a new state tree. By default, returns the state tree as is.
4. **internals**: a boolean option that allows access to certain internal functions.

### Accessing the Database

The SQLite database can be accessed through the `core._db` property. This allows you to execute SQL statements as per the [SQL.js](https://sql.js.org/documentation/index.html) API.

### The State Table

The state table is simply a SQL table named "state" that is automatically defined on initialization. Any additional columns defined under `stateColumns` will be added to this table. This table exists as a singleton (meaning only one record is stored), thus any columns in the state table will be automatically mapped to an object key.

### Features

A feature is made up of the following elements:

1. **namespace** (required): a namespace on the `core` to access this feature
2. **schema** (optional): an sql schema related to this feature. Can include table definitions, indexes, triggers, etc. Expects valid SQL statements.
3. **context** (optional): a function that accepts the `core` and returns an object of **context handlers** that will interact with database and/or perform computations.

#### Writing Context Handlers

Context handlers are simply functions that implement business logic. These functions have access to the `core`, allowing database reading/writing as well as accessing other context handlers.

## Developer

```bash
# install dependencies
npm i

# run tests
npm test

# dev in watch mode
npm run watch # in separate console
npm run test-watch # in separate console

# compile the library
npm run build
```

### Architecture

TODO

## License

MIT
