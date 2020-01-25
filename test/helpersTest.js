const { assert } = require('chai');

const { lookUpUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookUpUserByEmail("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined with invalid email', function() {
    const user = lookUpUserByEmail("use@example.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});