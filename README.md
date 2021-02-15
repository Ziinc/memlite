# Memlite

Memlite is a SQLite state management library. It can be used to create, manage, and manipulate a state tree. __mem__ stands for memory, as the SQLite database is held in memory.


## Features

- Platform/framework agnostic.
- SQL state management (using SQLite).

## Installation
```bash
npm i memlite
```

## Quickstart

```js
// initialize the mem
import memlite from 'memlite'

const context = mem => ({
  set(input){
    let sql = mem._db.prepare("UPDATE state set hello=?;");
    sql.run([input]);
  },
  clear(){
    mem._db.run("UPDATE state SET hello=null");
  }
})

// initialize the mem of the application
let mem = memlite.init({
  stateColumns: ["hello text"],
  features: [{ namespace: "quickstart", context: context }]
)

// access the state table
console.log(mem.state) // {hello: null}
mem.quickstart.set("world")
console.log(mem.state) // {hello: "world"}
mem.quickstart.clear()
console.log(mem.state) // {hello: null}
```

## Documentation

### Introduction
Memlite intends to provide an SQL-centric way of dealing with and building a state tree for consumption in parent applications, be it web, mobile, or desktop. 

#### When To Use
You should reach for this library if:
1. You have a lot of local or fetched data that you would like to perform queries on.
2. You like SQL and think that it is a beautiful query language.
3. You like some magic but not too muchdo not like too much magic.

#### Mental Model
Memlite borrows some concepts from [https://elixir-lang.org/](Elixir), such as domain-driven design (in the form of feature contexts).

A `mem` object represents your app's current state and features at at any point in time. We change the application's state by executing functions declared in a feature's `context`. These functions (which may be referred to as handlers in the docs) will perform the logic required to update your app's state. These handlers do not necessarily need to update the SQL database, but could perform side effects or async data fetching. In any case, each context handler will have access to the `mem` object so that it can call other handlers as needed.

Each feature declared will represent a feature of your application, and would help to organize your business-logic in a feature-centric way. There are no fixed rules on file organization -- this is a library, not a framework.

### Initialization

When initializing the `mem`, you can provide the following options:

1. **stateColumns**: a list of sql columns to be added to the `state` table.
2. **features**: refer to the **Features** section
3. **buildState**: a function that receives the current state table as an object, and manipulates and returns a new state tree. By default, returns the state tree as is.
4. **internals**: a boolean option that allows access to certain internal functions.

### Accessing the Database

The SQLite database can be accessed through the `mem._db` property. This allows you to execute SQL statements as per the [SQL.js](https://sql.js.org/documentation/index.html) API.

### The State Table

The state table is simply a SQL table named "state" that is automatically defined on initialization. Any additional columns defined under `stateColumns` will be added to this table. This table exists as a singleton (meaning only one record is stored), thus any columns in the state table will be automatically mapped to an object key.

### Features

A feature is made up of the following elements:

1. **namespace** (required): a namespace on the `mem` to access this feature
2. **schema** (optional): an sql schema related to this feature. Can include table definitions, indexes, triggers, etc. Expects valid SQL statements.
3. **context** (optional): a function that accepts the `mem` and returns an object of **context handlers** that will interact with database and/or perform computations.

#### Writing Context Handlers

Context handlers are simply functions that implement business logic. These functions have access to the `mem`, allowing database reading/writing as well as accessing other context handlers.

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
