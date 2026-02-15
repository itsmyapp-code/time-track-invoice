import React from "react";
import { NavLink } from "react-router-dom";
import { FaTasks, FaFileAlt, FaUsers, FaReceipt, FaThLarge } from "react-icons/fa";

export default function Menu() {
  return (
    <nav className="bg-blue-700 text-white px-4 py-3 flex gap-6 items-center">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          "flex items-center gap-2 px-2 py-1 rounded " +
          (isActive ? "bg-blue-900 font-bold" : "")
        }
      >
        <FaThLarge /> Dashboard
      </NavLink>
      <NavLink
        to="/jobs"
        className={({ isActive }) =>
          "flex items-center gap-2 px-2 py-1 rounded " +
          (isActive ? "bg-blue-900 font-bold" : "")
        }
      >
        <FaTasks /> Jobs
      </NavLink>
      <NavLink
        to="/reports"
        className={({ isActive }) =>
          "flex items-center gap-2 px-2 py-1 rounded " +
          (isActive ? "bg-blue-900 font-bold" : "")
        }
      >
        <FaFileAlt /> Reports
      </NavLink>
      <NavLink
        to="/clients"
        className={({ isActive }) =>
          "flex items-center gap-2 px-2 py-1 rounded " +
          (isActive ? "bg-blue-900 font-bold" : "")
        }
      >
        <FaUsers /> Clients
      </NavLink>
      <NavLink
        to="/invoices"
        className={({ isActive }) =>
          "flex items-center gap-2 px-2 py-1 rounded " +
          (isActive ? "bg-blue-900 font-bold" : "")
        }
      >
        <FaReceipt /> Invoices
      </NavLink>
      <NavLink
        to="/help"
        className={({ isActive }) =>
          "ml-auto flex items-center gap-2 px-2 py-1 rounded text-lg " +
          (isActive ? "bg-blue-900 font-bold" : "")
        }
        title="Help"
      >
        <span style={{fontSize: "1.3em"}}>?</span>
      </NavLink>
    </nav>
  );
}