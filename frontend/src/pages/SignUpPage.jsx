import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

function SignUp() {
  const { authuser, isLoading, login} = useAuthStore();
  return (
    <div>
     SignUp
    </div>
  )
}

export default SignUp
