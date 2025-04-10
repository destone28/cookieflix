// src/components/Layout.jsx - versione corretta
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Questo è il punto critico: mostriamo sia l'Outlet che eventuali children */}
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;