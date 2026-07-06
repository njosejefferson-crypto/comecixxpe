import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const emailInvalid = touched && !/^\S+@\S+\.\S+$/.test(email);
  const passwordInvalid = touched && password.length < 4;

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);

    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 4) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await login(email, password);
      const returnUrl = location.state?.from?.pathname ?? '/products';
      navigate(returnUrl, { replace: true });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <h1 className="login__title">Iniciar sesión</h1>

        <label className="login__label" htmlFor="email">
          Correo electrónico
        </label>
        <input
          className="login__input"
          id="email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailInvalid && <span className="login__hint">Ingresa un correo válido.</span>}

        <label className="login__label" htmlFor="password">
          Contraseña
        </label>
        <input
          className="login__input"
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordInvalid && (
          <span className="login__hint">La contraseña debe tener al menos 4 caracteres.</span>
        )}

        {errorMessage && <p className="login__error">{errorMessage}</p>}

        <button className="login__btn" type="submit" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="login__footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </section>
  );
}
