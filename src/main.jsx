import React from "react"
import { createRoot } from "react-dom/client"
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
})

function App() {
  const [health, setHealth] = React.useState(null)

  React.useEffect(() => {
    api.get("/health")
      .then(res => setHealth(res.data))
      .catch(err => setHealth({ error: err.message }))
  }, [])

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>Construction CRM (frontend baseline)</h1>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  )
}

createRoot(document.getElementById("root")).render(<App />)
