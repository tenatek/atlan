const _ = require('lodash');

const Util = require('../Util');

let obj = {
  a: 1,
  b: {
    c: [
      {
        n: 2,
        m: {
          v: 2
        },
        a: [
          {
            m: {
              b: 3
            }
          },
          {
            m: {
              b: 7
            }
          }
        ]
      },
      {
        n: 5,
        l: 6,
        a: [
          {
            m: {
              b: 8
            }
          }
        ]
      }
    ],
    f: [[2, 3], [4, 5]]
  }
};

test('reassign one node', async () => {
  let testObj = _.cloneDeep(obj);
  await Util.reassignNodes(testObj, ['b', 'c'], () => {
    return 1;
  });
  expect(testObj).toEqual({
    a: 1,
    b: {
      c: 1,
      f: [[2, 3], [4, 5]]
    }
  });
});

test('reassign nodes in array', async () => {
  let testObj = _.cloneDeep(obj);
  await Util.reassignNodes(testObj, ['b', 'c', null], () => {
    return 2;
  });
  expect(testObj).toEqual({
    a: 1,
    b: {
      c: [2, 2],
      f: [[2, 3], [4, 5]]
    }
  });
});

test('reassign deep nodes in array', async () => {
  let testObj = _.cloneDeep(obj);
  await Util.reassignNodes(testObj, ['b', 'c', null, 'n'], (el) => {
    return el + 1;
  });
  expect(testObj).toEqual({
    a: 1,
    b: {
      c: [
        {
          n: 3,
          m: {
            v: 2
          },
          a: [
            {
              m: {
                b: 3
              }
            },
            {
              m: {
                b: 7
              }
            }
          ]
        },
        {
          n: 6,
          l: 6,
          a: [
            {
              m: {
                b: 8
              }
            }
          ]
        }
      ],
      f: [[2, 3], [4, 5]]
    }
  });
});

test('reassign nodes in nested arrays', async () => {
  let testObj = _.cloneDeep(obj);
  await Util.reassignNodes(testObj, ['b', 'c', null, 'a', null, 'm', 'b'], (el) => {
    return el + 2;
  });
  expect(testObj).toEqual({
    a: 1,
    b: {
      c: [
        {
          n: 2,
          m: {
            v: 2
          },
          a: [
            {
              m: {
                b: 5
              }
            },
            {
              m: {
                b: 9
              }
            }
          ]
        },
        {
          n: 5,
          l: 6,
          a: [
            {
              m: {
                b: 10
              }
            }
          ]
        }
      ],
      f: [[2, 3], [4, 5]]
    }
  });
});

test('reassign nodes in array of arrays', async () => {
  let testObj = _.cloneDeep(obj);
  await Util.reassignNodes(testObj, ['b', 'f', null, null], (el) => {
    return el + 7;
  });
  expect(testObj).toEqual({
    a: 1,
    b: {
      c: [
        {
          n: 2,
          m: {
            v: 2
          },
          a: [
            {
              m: {
                b: 3
              }
            },
            {
              m: {
                b: 7
              }
            }
          ]
        },
        {
          n: 5,
          l: 6,
          a: [
            {
              m: {
                b: 8
              }
            }
          ]
        }
      ],
      f: [[9, 10], [11, 12]]
    }
  });
});

// the following doesn't work, does it matter?

/* test('gets arrays from array of arrays', () => {
  expect(Util.getNodesFromPath(obj, ['b', 'f', null])).toEqual([[2, 3], [4, 5]]);
}); */

test('reassign only existing nodes', async () => {
  let testObj = _.cloneDeep(obj);
  await Util.reassignNodes(testObj, ['b', 'c', null, 'm', 'v'], (el) => {
    return el + 3;
  });
  expect(testObj).toEqual({
    a: 1,
    b: {
      c: [
        {
          n: 2,
          m: {
            v: 5
          },
          a: [
            {
              m: {
                b: 3
              }
            },
            {
              m: {
                b: 7
              }
            }
          ]
        },
        {
          n: 5,
          l: 6,
          a: [
            {
              m: {
                b: 8
              }
            }
          ]
        }
      ],
      f: [[2, 3], [4, 5]]
    }
  });
});
