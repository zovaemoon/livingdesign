import { Link, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { LoadingState } from './StatusMessage.jsx'

export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState text="로그인 상태를 확인하는 중…" />
  if (!user) {
    return (
      <section className="mx-auto max-w-md py-16 text-center">
        <p className="eyebrow">Members only</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">로그인이 필요합니다</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          수업 자료와 학생 작품은 로그인한 사용자만 볼 수 있습니다.
        </p>
        <Link to="/login" state={{ from: location.pathname + location.search }} className="btn-primary mt-8">
          로그인하러 가기
        </Link>
      </section>
    )
  }
  return <Outlet />
}
