# Memlite

Memlite is a SQLite state management library. It can be used to create, manage, and manipulate a state tree. **mem** stands for memory, as the SQLite database is held in memory.

## Features

- Platform/framework agnostic.
- SQL state masnagement (using SQLite).

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
3. You like some magic but not too much.

#### Mental Model

Memlite allows domain-driven design (in the form of feature contexts).

A `mem` object represents your app's current state and features at at any point in time. We change the application's state by executing functions declared in a feature's `context` from the view layer. These context functions may perform side effects as well, such as async data fetching and loading into the database.

Each context handler has access to the `mem` object, allowing it to call other context functions as needed.

There are no fixed rules on file organization -- this is a li
brary, not a framework.

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

1. **namespace** (string, required): a namespace on the `mem` to access this feature, for feature segregation.
2. **schema** (string, optional): an sql schema related to this feature.
3. **context** (function => object, optional): a function that accepts the `mem` and returns an object that will interact with the database and/or perform computations.

#### Namespace

For example, we can register a feature on the `mem.hello` namespace.

```js
const app = memlite.init({
  features: [{ namespace: "hello" }],
});

// access the feature
app.hello;
```

#### Schema

An sql schema can be provided for this feature. This can include one or more table definitions, indexes, triggers, etc. This string needs to be valid SQL statements, as there is no SQL syntax checking performed by this library.

For example, on our `mem.todos` namespace, we can create multiple tables.

```js
const todoFeature = {
  namespace: todos,
  schema: `
CREATE TABLE todos (
	title TEXT,
	description TEXT,
	user_id INTEGER NOT NULL
);
CREATE TABLE todos_hierarchy (
	parent_id INTEGER NOT NULL,
	child_id INTEGER NOT NULL
);
`,
};

const app = memlite.init({ features: [todoFeature] });
```

In this example, we will create two tables, `todos` and `todos_hierarchy`. We can use `todos_hierarchy` to define task hierarchy in our `todos` feature.

When the database is initiated, the schemas are executed in sequential order as given in the `features` array. As such, schemas that depend on another feature's schema (such as triggers) should be placed after dependencies in order to get executed later.

#### Context

A context is a function that accepts the `mem` object and returns an object of **functions**.

Context functions implement state updating logic. As these functions have access to `mem`, it allows for database reading/writing as well as accessing other context functions.

You can also define a context function that does not interact with the database, such as performing async datafetching.

##### Example

In this example, we will query the `todos` table to list all todos with their `rowid` that SQLite automatically creates. It is on the `mem.todos` namespace, hence we will call the `list_todos()` function to obtain the results from the database directly.

```js
const todoFeature = {
  namespace: "todos",
  schema: "CREATE TABLE todos (title TEXT);",
  context: (mem) => ({
    list_todos() {
      return mem._db.run("SELECT rowid, title FROM todos");
    },
  }),
};

let mem = memlite.init({ features: [todoFeature] });

mem.todos.list_todos();
```

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
