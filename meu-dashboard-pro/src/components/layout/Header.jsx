import React, { useState } from 'react';
import { navLinks } from '../../config/navigation';
import ChartBarIcon from '../icons/ChartBarIcon';
import ThemeToggle from '../common/ThemeToggle';
import MenuIcon from '../icons/MenuIcon';
import XIcon from '../icons/XIcon';
import NavButton from '../common/NavButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const NavLinks = () => (
    <>
      {navLinks.map((link) => (
        <NavButton key={link.to} to={link.to}>
          {link.label}
        </NavButton>
      ))}
    </>
  );

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 md:w-10 md:h-10 mr-3 text-teal-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                Dashboard de Provas
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                Sua central de análise de desempenho.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <span className="sr-only">Abrir menu</span>
                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação de Desktop */}
      <nav className="hidden md:flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
        <NavLinks />
      </nav>

      {/* Navegação Mobile */}
      {isMenuOpen && (
        <nav
          onClick={closeMenu}
          className="flex flex-col space-y-2 md:hidden mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
        >
          <NavLinks />
        </nav>
      )}
    </>
  );
};

export default Header; 