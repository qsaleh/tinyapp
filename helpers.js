
function lookUpUserByEmail(emailInput, database){
  const obj = Object.values(database);
  for (let user of obj) {
    if (user.email === emailInput) {
      return user;
    }
  }
}



module.exports = { lookUpUserByEmail};
