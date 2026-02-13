import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <h1>{{PROJECT_TITLE}}</h1>
      <p>Welcome to your React + TypeScript project!</p>
    </div>
  </StrictMode>,
)
