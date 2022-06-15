import { h, Component, render } from 'preact'
import { useState, useEffect } from 'preact/hooks'

import magic from '../../app/client'

const bridge = magic()

function App () {
  
  const [val, setVal] = useState(null);

  useEffect(async () => {
    setVal(await bridge.retrieve())
  }, []);

  async function saveToDatabase() {
    await bridge.save()
  }

  return <div>
    <p>{val}</p>
    <button onClick={saveToDatabase}>Save to DB</button>
  </div>
}

render(<App/>, document.body)
