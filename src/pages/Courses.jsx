import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { createCourse, listCourses } from '../services/index.js'
import { PAGE_SIZE } from '../config.js'
import CourseForm from '../components/CourseForm.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/StatusMessage.jsx'

export default function Courses() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [cursor, setCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const loadFirst = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const page = await listCourses({ pageSize: PAGE_SIZE })
      setCourses(page.items)
      setCursor(page.nextCursor)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const page = await listCourses({ pageSize: PAGE_SIZE, cursor })
      setCourses((prev) => [...prev, ...page.items])
      setCursor(page.items.length ? page.nextCursor : null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleCreate(data) {
    const id = await createCourse(data)
    navigate(`/courses/${id}`)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="eyebrow">Courses</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">수업</h1>
        </div>
        {isAdmin && !showForm && (
          <button type="button" className="btn-accent" onClick={() => setShowForm(true)}>
            + 수업 추가
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">새 수업</h2>
          <CourseForm submitLabel="수업 만들기" onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="mt-10">
        {loading ? (
          <LoadingState />
        ) : error && courses.length === 0 ? (
          <ErrorState message={error} onRetry={loadFirst} />
        ) : courses.length === 0 ? (
          <EmptyState text={isAdmin ? '아직 수업이 없습니다. "수업 추가" 버튼으로 첫 수업을 만들어 보세요.' : '아직 등록된 수업이 없습니다.'} />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <li key={course.id}>
                  <Link
                    to={`/courses/${course.id}`}
                    className="group flex h-full flex-col border border-stone-200 p-6 transition-colors hover:border-stone-900"
                  >
                    {course.semester && <span className="text-xs text-accent">{course.semester}</span>}
                    <h2 className="mt-2 text-lg font-semibold text-stone-900">{course.title}</h2>
                    {course.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600">{course.description}</p>
                    )}
                    <span className="mt-auto pt-6 text-sm text-stone-400 group-hover:text-stone-900">자세히 보기 →</span>
                  </Link>
                </li>
              ))}
            </ul>
            {error && <ErrorState message={error} />}
            {cursor && (
              <div className="mt-10 text-center">
                <button type="button" className="btn-outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? '불러오는 중…' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
