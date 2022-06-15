const crypto = require('crypto')

class Database {
  save() {
    console.log('Saving to DB')
  }

  retrieve() {
    return crypto.randomBytes(20).toString('hex')
  }
}

module.exports = Database