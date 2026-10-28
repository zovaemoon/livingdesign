import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { listRecentPosts } from '../services/index.js'
import { INTRO, SITE_TAGLINE } from '../config.js'
import { MaterialList, WorkGrid } from '../components/PostCard.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessage.jsx'

function RecentSection({ title, type, count }) {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setPosts(null)
    try {
      setPosts(await listRecentPosts(type, count))
    } catch (err) {
      setError(err.message)
    }
  }, [type, count])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="mt-20" aria-labelledby={`recent-${type}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 id={`recent-${type}`} className="text-xl font-semibold text-stone-900">
          {title}
        </h2>
        <Link to="/courses" className="text-sm text-stone-500 hover:text-stone-900">
          수업 전체 보기 →
        </Link>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !posts ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState text="아직 게시물이 없습니다." />
      ) : type === 'work' ? (
        <WorkGrid posts={posts} />
      ) : (
        <MaterialList posts={posts} />
      )}
    </section>
  )
}

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div>
      <section className="max-w-3xl pt-4 sm:pt-10">
        <p className="eyebrow">{SITE_TAGLINE}</p>
        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-stone-900 sm:text-5xl">
          {INTRO.title}
        </h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-stone-600 sm:text-lg">
          {INTRO.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 h-px w-16 bg-accent" aria-hidden="true" />
      </section>

      {!loading && !user && (
        <section className="mt-16 border-t border-stone-200 pt-10">
          <p className="text-sm text-stone-600">로그인하면 수업 자료와 학생 작품을 볼 수 있고, 댓글로 함께 토론할 수 있습니다.</p>
          <Link to="/login" className="btn-primary mt-5">
            로그인하기
          </Link>
        </section>
      )}

      {user && (
        <>
          <RecentSection title="최근 수업 자료" type="material" count={3} />
          <RecentSection title="최근 학생 작품" type="work" count={6} />
        </>
      )}
    </div>
  )
}
