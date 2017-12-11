const util = require('../package/util')

const object = {
  a: {
    b: {
      c: 'f'
    },
    c: 'hgdfh'
  }
}

test('returns the correct node', () => {
  expect(util.getNodeFromPath(object, 'a/b')).toEqual({
    c: 'f'
  })
})

test('returns "undefined" if the last segment has no match', () => {
  expect(util.getNodeFromPath(object, 'a/b/g')).toBe(undefined)
})

test('returns "true" if all keys are known', () => {
  expect(util.rejectUnknownKeys(object.a, ['b', 'c', 'd'])).toBe(true)
})

test('returns "false" if there are unknown keys', () => {
  expect(util.rejectUnknownKeys(object, ['b', 'c', 'd'])).toBe(false)
})
