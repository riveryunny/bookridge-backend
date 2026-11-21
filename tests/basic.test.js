const test = require("node:test");
const assert = require("node:assert/strict");

test("기본 문자열 처리 테스트", () => {
  assert.equal("bookridge".toUpperCase(), "BOOKRIDGE");
});