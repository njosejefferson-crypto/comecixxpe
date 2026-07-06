import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/products');
  }

  return (
    <nav className="navbar">
      <NavLink className="navbar__brand" to="/products">
        <span className="navbar__logo">🍗</span>
        <span className="navbar__title">ComeCix</span>
      </NavLink>

      <div className="navbar__links">
        <NavLink
          className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}
          to="/products"
        >
          Catálogo
        </NavLink>
        <NavLink
          className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}
          to="/cart"
        >
          Carrito
          {totalItems > 0 && <span className="navbar__badge">{totalItems}</span>}
        </NavLink>
      </div>

      <div className="navbar__auth">
        {isAuthenticated ? (
          <>
            <span className="navbar__user">Hola, {currentUser?.name}</span>
            <button className="navbar__btn navbar__btn--outline" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <NavLink className="navbar__btn" to="/login">
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}
