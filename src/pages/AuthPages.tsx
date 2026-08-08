import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { AuthForm } from '@/features/auth/components/AuthForm'
import { useEntrance } from '@/features/transition/EntranceContext'

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-svh place-items-center px-6 py-32">{children}</main>
  )
}

export function SignInPage() {
  const { signIn } = useAuth()
  const { play } = useEntrance()
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <AuthForm
        mode="signin"
        onSubmit={async ({ email, password }) => {
          await signIn({ email, password })
          // Corridor first, then the destination mounts underneath it.
          play()
          navigate('/dashboard', { replace: true })
        }}
      />
    </AuthLayout>
  )
}

export function SignUpPage() {
  const { signUp } = useAuth()
  const { play } = useEntrance()
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <AuthForm
        mode="signup"
        onSubmit={async (input) => {
          await signUp(input)
          play()
          navigate('/dashboard', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
