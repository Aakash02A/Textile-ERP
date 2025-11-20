import React from 'react'
import Navbar from '../../components/layout/Navbar'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-content">
        <h1>Textile ERP Dashboard</h1>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Procurement</h3>
            <p>Manage suppliers and purchase orders</p>
          </div>
          <div className="dashboard-card">
            <h3>Inventory</h3>
            <p>Track raw materials and stock levels</p>
          </div>
          <div className="dashboard-card">
            <h3>Production</h3>
            <p>Monitor work orders and production progress</p>
          </div>
          <div className="dashboard-card">
            <h3>Quality Control</h3>
            <p>Log defects and track quality metrics</p>
          </div>
          <div className="dashboard-card">
            <h3>Sales</h3>
            <p>Manage customer orders and feedback</p>
          </div>
          <div className="dashboard-card">
            <h3>Reports</h3>
            <p>View analytics and ML insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard