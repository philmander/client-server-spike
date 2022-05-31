module.exports = {
  add: async function() {
    const res = await fetch('http://localhost:3000/bridge')
    const json = res.json()
    return json.result
  }
}