import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { demoSignIn, isDemoMode, resetDemoData, signInWithGoogle } from '../services/index.js'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const from = location.state?.from || '/'

  async function attempt(key, fn) {
    setPending(key)
    setError('')
    try {
      await fn()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setPending('')
    }
  }

  async function handleReset() {
    if (!window.confirm('데모 데이터를 처음 상태로 되돌릴까요? 이 브라우저에서 작성한 내용이 모두 지워집니다.')) return
    await resetDemoData()
    setNotice('데모 데이터를 초기화했습니다.')
  }

  return (
    <section className="mx-auto max-w-sm py-10 sm:py-16">
      <h1 className="text-2xl font-semibold text-stone-900">로그인</h1>

      {user ? (
        <div className="mt-6 text-sm text-stone-600">
          <p>
            <strong className="font-medium text-stone-900">{user.displayName}</strong> 님으로 로그인되어 있습니다.
          </p>
          <Link to="/courses" className="btn-primary mt-6">
            수업 보러 가기
          </Link>
        </div>
      ) : isDemoMode ? (
        <div className="mt-6">
          <p className="text-sm leading-relaxed text-stone-600">
            지금은 데모 모드입니다. 원하는 역할을 골라 둘러보세요. 작성한 내용은 이 브라우저에만 저장됩니다.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className="btn-primary py-3"
              disabled={Boolean(pending)}
              onClick={() => attempt('professor', () => demoSignIn('professor'))}
            >
              {pending === 'professor' ? '로그인 중…' : '데모: 교수로 로그인'}
            </button>
            <button
              type="button"
              className="btn-outline py-3"
              disabled={Boolean(pending)}
              onClick={() => attempt('student', () => demoSignIn('student'))}
            >
              {pending === 'student' ? '로그인 중…' : '데모: 학생으로 로그인'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm leading-relaxed text-stone-600">Google 계정으로 로그인해 주세요.</p>
          <button
            type="button"
            className="btn-outline mt-8 w-full py-3"
            disabled={Boolean(pending)}
            onClick={() => attempt('google', signInWithGoogle)}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            {pending ? '로그인 중…' : 'Google 계정으로 로그인'}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">팝업 창이 열리지 않으면 브라우저의 팝업 차단을 해제해 주세요.</p>
        </div>
      )}

      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {isDemoMode && (
        <div className="mt-12 border-t border-stone-200 pt-6">
          <button type="button" onClick={handleReset} className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-900">
            데모 데이터 초기화
          </button>
          {notice && (
            <p className="mt-2 text-xs text-stone-600" role="status">
              {notice}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
