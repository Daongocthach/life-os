import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { LoginFormValues } from '@/schemas/authSchema'

export function useAuth() {
  const { user, session, isLoading, setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // 2. Listen for auth changes (token refreshed, sign in, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setUser, setLoading])

  const login = async (values: LoginFormValues) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast.error('Đăng nhập thất bại: ' + error.message)
        return false
      }

      setSession(data.session)
      setUser(data.user)
      toast.success('Đăng nhập thành công!')
      return true
    } catch (err: unknown) {
      toast.error('Lỗi khi đăng nhập')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      toast.success('Đã đăng xuất')
    } catch (err) {
      toast.error('Lỗi khi đăng xuất')
    }
  }

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
  }
}
