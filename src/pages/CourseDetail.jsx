import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { deleteCourse, getCourse, updateCourse } from '../services/index.js'
import CourseForm from '../components/CourseForm.jsx'
import PostList from '../components/PostList.jsx'
import { ErrorState, LoadingState } from '../components/StatusMessage.jsx'
import NotFound from './NotFound.jsx'

const TABS = [
  { key: 'material', label: '수업 자료' },
  { key: 'work', label: '학생 작품' },
]

export default function CourseDetail() {
  const { courseId } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'work' ? 'work' : 'material'

  const [course, setCourse] = useState(undefined)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setError('')
    setCourse(undefined)
    try {
      setCourse(await getCourse(courseId))
    } catch (err) {
      setError(err.message)
    }
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  async function handleUpdate(data) {
    await updateCourse(courseId, data)
    setCourse((prev) => ({ ...prev, ...data, title: data.title.trim(), semester: data.semester.trim() }))
    setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm(`"${course.title}" 수업을 삭제할까요?`)) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteCourse(courseId)
      navigate('/courses', { replace: true })
    } catch (err) {
      setActionError(err.message)
      setDeleting(false)
    }
  }

  function selectTab(key) {
    setSearchParams(key === 'work' ? { tab: 'work' } : {}, { replace: true })
  }

  // 좌우 화살표로 탭 이동 (WAI-ARIA 탭 패턴)
  function onTabKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = tab === 'material' ? 'work' : 'material'
    selectTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (course === undefined) return <LoadingState />
  if (course === null) return <NotFound />

  const newPostLink = `/posts/new?courseId=${encodeURIComponent(courseId)}&type=${tab}`
  const canWrite = tab === 'work' || isAdmin

  return (
    <div>
      <Link to="/courses" className="text-sm text-stone-500 hover:text-stone-900">
        ← 수업 목록
      </Link>

      {editing ? (
        <div className="mt-6">
          <h1 className="mb-4 text-lg font-semibold">수업 정보 수정</h1>
          <CourseForm initial={course} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </div>
      ) : (
        <header className="mt-6 border-b border-stone-200 pb-8">
          {course.semester && <p className="text-sm text-accent">{course.semester}</p>}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{course.title}</h1>
          {course.description && (
            <p className="mt-5 max-w-3xl leading-relaxed whitespace-pre-line text-stone-600">{course.description}</p>
          )}
          {isAdmin && (
            <div className="mt-6 flex gap-2">
              <button type="button" className="btn-outline" onClick={() => setEditing(true)}>
                수업 수정
              </button>
              <button type="button" className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? '삭제 중…' : '수업 삭제'}
              </button>
            </div>
          )}
          {actionError && <ErrorState message={actionError} />}
        </header>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="수업 내용" className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              aria-controls={`panel-${t.key}`}
              tabIndex={tab === t.key ? 0 : -1}
              onClick={() => selectTab(t.key)}
              onKeyDown={onTabKeyDown}
              className={`border-b-2 pb-2 text-sm transition-colors ${
                tab === t.key ? 'border-stone-900 font-medium text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {canWrite && (
          <Link to={newPostLink} className="btn-primary">
            {tab === 'material' ? '+ 자료 추가' : '+ 작품 올리기'}
          </Link>
        )}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-8">
        <PostList key={tab} courseId={courseId} type={tab} />
      </div>
    </div>
  )
}
