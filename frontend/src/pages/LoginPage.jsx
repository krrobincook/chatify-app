import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
function LoginPage() {
    const { authuser, isLoading, login} = useAuthStore();
  return (
    <div>
      Login
    </div>
  )
}

export default LoginPage
