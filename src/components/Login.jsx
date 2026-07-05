import React, { useState } from 'react';
import { PawPrint, LogIn } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const ERROR_MESSAGES = {
  'auth/invalid-email': 'El email no es válido.',
  'auth/user-not-found': 'No existe un usuario con ese email.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'No se pudo iniciar sesión. Revisá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mostrador-root login-wrap">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <PawPrint size={30} color="var(--amber)" />
        </div>
        <div className="login-title">Mostrador</div>
        <div className="login-sub">Iniciá sesión con la cuenta del negocio</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="m-field">
            <span className="m-label">Email</span>
            <input
              className="m-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="m-field">
            <span className="m-label">Contraseña</span>
            <input
              className="m-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="m-btn m-btn-amber m-btn-block" type="submit" disabled={loading}>
            <LogIn size={17} /> {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
