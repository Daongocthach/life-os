import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles, Lock, Mail, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { loginSchema, type LoginFormValues } from '@/schemas/authSchema'

export function LoginView() {
  const { t } = useI18n()
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await login(values)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md border-border/80 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 pb-4 border-b border-border/40 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">LifeOS</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Hệ điều hành quản lý cuộc sống: Chi tiêu, Gym, Thực đơn & Tiếng Anh
          </p>
        </div>

        <CardContent className="p-6">
          <CardHeader className="p-0 pb-4 text-center sm:text-left">
            <CardTitle className="text-lg font-bold">{t.common.login}</CardTitle>
            <CardDescription>
              Đăng nhập bằng tài khoản Supabase đã cấp quyền
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {t.common.email}
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="bg-background/80"
              />
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                {t.common.password}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="bg-background/80"
              />
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 font-bold shadow-md h-10"
            >
              {isLoading ? (
                t.common.loading
              ) : (
                <>
                  {t.common.login}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground">
            Phiên đăng nhập được lưu trữ tự động và tự làm mới (auto-refresh token)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
