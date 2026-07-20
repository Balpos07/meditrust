import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PermissionGate({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
