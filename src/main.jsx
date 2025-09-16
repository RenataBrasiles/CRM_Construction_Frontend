import React from "react"
import { createRoot } from "react-dom/client"
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://crm-construction-api.onrender.com",
})

function App(){
  const [health, setHealth] = React.useState(null)
  React.useEffect(()=>{
    api.get("/health").then(r=>setHealth(r.data)).catch(e=>setHealth({error:e.message}))
  },[])
  return (
    <div style={{fontFamily:"system-ui", padding:24}}>
      <h1>Construction CRM (frontend)</h1>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  )
}
createRoot(document.getElementById("root")).render(<App/>)
