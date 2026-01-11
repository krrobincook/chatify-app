import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
function Login() {
    const { authuser, isLoading, login} = useAuthStore();
  return (
    <div>
      Login
    </div>
  )
}

export default Login
