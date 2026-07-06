import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const nameInvalid = touched && !name.trim();
  const emailInvalid = touched && !/^\S+@\S+\.\S+$/.test(email);
  const passwordInvalid = touched && password.length < 4;

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);

    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || password.length < 4) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/products');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <h1 className="login__title">Crear cuenta</h1>

        <label className="login__label" htmlFor="name">
          Nombre
        </label>
        <input
          className="login__input"
          id="name"
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameInvalid && <span className="login__hint">El nombre es obligatorio.</span>}

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
          {submitting ? 'Creando cuenta...' : 'Registrarme'}
        </button>

        <p className="login__footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </section>
  );
}
