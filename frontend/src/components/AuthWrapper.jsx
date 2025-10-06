import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AuthWrapper = ({ children }) => {
  // Toujours appeler les hooks dans le même ordre
  const authContext = useContext(AuthContext);
  const authData = authContext || { user: null, isAuthenticated: false };

  // Passer les données d'auth comme props aux enfants
  return React.cloneElement(children, { authData });
};

export default AuthWrapper;