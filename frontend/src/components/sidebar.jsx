import { NavLink } from "react-router-dom";
import "./Sidebar.css";


export default function Sidebar() {

  return (

    <aside className="sidebar">

      {/* LOGO / TITRE */}
      <div className="sidebar-logo">

        <div className="sidebar-logo-icon">
          AI
        </div>

        <div>
          <h2>
            BankAssist
          </h2>

          <span>
            Classification IA
          </span>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="sidebar-nav">


        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >

          <span className="sidebar-icon">
            🏠
          </span>

          <span>
            Accueil
          </span>

        </NavLink>


        <NavLink
          to="/import"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >

          <span className="sidebar-icon">
            📥
          </span>

          <span>
            Import
          </span>

        </NavLink>


        <NavLink
          to="/historique"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >

          <span className="sidebar-icon">
            🕘
          </span>

          <span>
            Historique
          </span>

        </NavLink>


        <NavLink
          to="/statistiques"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >

          <span className="sidebar-icon">
            📊
          </span>

          <span>
            Statistiques
          </span>

        </NavLink>

      </nav>


      {/* BAS DE SIDEBAR */}
      <div className="sidebar-footer">

        <span>
          Système de classification
        </span>

        <small>
          FR · AR · EN
        </small>

      </div>

    </aside>
  );
}