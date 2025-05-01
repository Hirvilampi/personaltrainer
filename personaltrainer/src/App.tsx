import './App.css'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
      <nav className="navbar bg-primary" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Personal Trainer</a>
        </div>
        
      </nav>
      <Outlet />
    </>
  )
}

export default App
