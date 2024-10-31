import { sum } from '../src';

describe('sum function', () => {

  test('should add two numbers', () => {
    expect(sum(7, 4)).toBe(7 + 4);
  });

  test('should add multiple numbers', () => {
    expect(sum(7, 4, 1, 2)).toBe(7 + 4 + 1 + 2);
  });

});
