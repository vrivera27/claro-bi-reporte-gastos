import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Button, Typography, Box } from '@mui/material';
import GoogleButton from 'react-google-button';

const LoginPage: React.FC = () => {
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user?.email?.endsWith('@claro.com.pe')) {
        window.localStorage.setItem('authUser', JSON.stringify(user));
        window.location.href = '/';
      } else {
        console.error('Solo se permiten correos @claro.com.pe');
        signOut(auth);
      }
    } catch (error) {
      console.error('Error durante la autenticación con Google:', error);
      if ((error as any).code === 'auth/invalid-api-key') {
        console.error('La clave de API proporcionada es inválida.');
      } else if ((error as any).code === 'auth/configuration-not-found') {
        console.error('No se encontró la configuración de autenticación.');
      } else {
        console.error('Error desconocido:', error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Iniciar Sesión
      </Typography>
      <GoogleButton onClick={handleGoogleSignIn} />
    </Box>
  );
};

export default LoginPage;