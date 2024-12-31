
import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user?.email?.endsWith('@claro.com.pe')) {
        window.localStorage.setItem('authUser', JSON.stringify(user));
        window.location.href = '/';
      } else {
        setError('Solo se permiten correos @claro.com.pe');
        signOut(auth);
      }
    } catch (e) {
      setError('Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleGoogleSignIn}>Acceder con Google</button>
    </div>
  );
};

export default LoginPage;