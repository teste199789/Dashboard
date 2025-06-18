import React from 'react';
import { NavLink } from 'react-router-dom';

const NavButton = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive ? 'bg-teal-500 text-white' : 'text-gray-500 hover:bg-gray-200'
            }`
        }
    >
      {children}
    </NavLink>
);

export default NavButton;