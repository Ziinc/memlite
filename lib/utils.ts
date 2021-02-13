export default {
  newId: (): number => new Date().valueOf(),
  getIdFromString: (toSearch: string) => toSearch.match(/^(\d{13})/g),
  checkFormat: (toCheck: string) => {
    const pattern = RegExp("^(\\d{13})-(.+)", "g");
    return pattern.test(toCheck);
  },
  setDeep,
};

/**
 * https://stackoverflow.com/a/46008856
 * Dynamically sets a deeply nested value in an object.
 * Optionally "bores" a path to it if its undefined.
 * @function
 * @param {!object} obj  - The object which contains the value you want to change/set.
 * @param {!array} path  - The array representation of path to the value you want to change/set.
 * @param {!mixed} value - The value you want to set it to.
 * @param {boolean} setrecursively - If true, will set value of non-existing path as well.
 */
export function setDeep(obj, path, value, setrecursively = true) {
  path.reduce((acc, key, index) => {
    if (
      setrecursively &&
      typeof acc[key] === "undefined" &&
      index !== path.length - 1
    ) {
      acc[key] = {};
      return acc[key];
    }

    if (index === path.length - 1) {
      acc[key] = value;
      return value;
    }
    return acc[key];
  }, obj);
  return obj;
}

export function matrixToObjects(columns, values) {
  values = values.map((row) => {
    return columns.reduce((acc, col, idx) => {
      acc[col] = row[idx];
      return acc;
    }, {});
  });
  // convert nested dot keys to nested objects
  values = values.map((obj) => buildNestedObjects(obj));
  return values;
}

// // split dotkeys and set the value
export function buildNestedObjects(obj) {
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
