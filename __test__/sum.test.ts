import { sum } from '../src'

describe('sum function', () => {

  test('should return 0 if only no argument provided', () => {
    expect(sum()).toBe(0)
  })

  test('should return input if only one argument provided', () => {
    expect(sum(7)).toBe(7)
  })

  test('should add two numbers', () => {
    expect(sum(7, 4)).toBe(7 + 4)
  })

  test('should add multiple numbers', () => {
    expect(sum(7, 4, 1, 2)).toBe(7 + 4 + 1 + 2)
  })

})
