import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EmitirBoleta from './components/EmitirBoleta';
import VerBoletas from './components/VerBoletas';
import './App.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        <header className="p-4" style={{ backgroundColor: '#F2F2F2', borderBottom: '1px solid #E0E0E0' }}>
          <h1 className="h3 text-primary">Sistema de Facturación</h1>
        </header>

        <div className="d-flex flex-grow-1">
          <nav className="bg-light text-dark p-4" style={{ minWidth: '250px' }}>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <Link to="/" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/emitir" className="nav-link">Emitir Boleta</Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="/boletas" className="nav-link">Ver Boletas</Link>
              </li>
            </ul>
          </nav>

          <main className="flex-grow-1 p-4" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/emitir" element={<EmitirBoleta />} />
              <Route path="/boletas" element={<VerBoletas />} />
            </Routes>
          </main>
        </div>

        <footer className="text-center p-3" style={{ backgroundColor: '#F2F2F2', borderTop: '1px solid #E0E0E0' }}>
          <p className="mb-0 text-dark">© 2024 - Derechos Reservados; Jose Jeampier Jara Salas</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
