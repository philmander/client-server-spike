const crypto = require('crypto')

class Database {
  save(_session_) {
    console.log(`Saving to DB for user ${_session_.userId}`)
  }

  retrieve() {
    return crypto.randomBytes(20).toString('hex')
  }
}

module.exports = Database