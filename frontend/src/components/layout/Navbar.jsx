import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Textile ERP</Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/procurement" className="nav-link">Procurement</Link>
        </li>
        <li className="nav-item">
          <Link to="/inventory" className="nav-link">Inventory</Link>
        </li>
        <li className="nav-item">
          <Link to="/production" className="nav-link">Production</Link>
        </li>
        <li className="nav-item">
          <Link to="/quality" className="nav-link">Quality Control</Link>
        </li>
        <li className="nav-item">
          <Link to="/sales" className="nav-link">Sales</Link>
        </li>
      </ul>
      <div className="navbar-actions">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  )
}

export default Navbar