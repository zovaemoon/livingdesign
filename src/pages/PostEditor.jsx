import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { createPost, getCourse, getPost, updatePost } from '../services/index.js'
import { toDisplayImageUrl } from '../utils/driveLink.js'
import { LIMITS, normalizePost, validatePost } from '../utils/validate.js'
import UrlListInput from '../components/UrlListInput.jsx'
import { ErrorState, LoadingState } from '../components/StatusMessage.jsx'

const TYPE_LABEL = { material: '수업 자료', work: '학생 작품' }

function emptyForm() {
  return { title: '', content: '', imageUrls: [''], links: [] }
}

export default function PostEditor() {
  const { postId } = useParams()
  const isEdit = Boolean(postId)
  const [searchParams] = useSearchParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [context, setContext] = useState(null) // { courseId, courseTitle, type }
  const [loadError, setLoadError] = useState('')
  const [initial, setInitial] = useState(null)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)
  const savedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadError('')
      try {
        if (isEdit) {
          const post = await getPost(postId)
          if (!post) throw new Error('게시물을 찾을 수 없습니다.')
          if (post.authorId !== user.uid && !isAdmin) throw new Error('작성자 또는 교수만 수정할 수 있습니다.')
          const course = await getCourse(post.courseId)
          if (cancelled) return
          const values = {
            title: post.title,
            content: post.content || '',
            imageUrls: post.imageUrls?.length ? post.imageUrls : [''],
            links: post.links || [],
          }
          setContext({ courseId: post.courseId, courseTitle: course?.title || '', type: post.type })
          setInitial(values)
          setForm(values)
        } else {
          const courseId = searchParams.get('courseId')
          const type = searchParams.get('type')
          if (!courseId || !TYPE_LABEL[type]) throw new Error('잘못된 주소입니다. 수업 페이지에서 다시 시작해 주세요.')
          if (type === 'material' && !isAdmin) throw new Error('수업 자료는 교수만 작성할 수 있습니다.')
          const course = await getCourse(courseId)
          if (!course) throw new Error('수업을 찾을 수 없습니다.')
          if (cancelled) return
          setContext({ courseId, courseTitle: course.title, type })
          setInitial(emptyForm())
          setForm(emptyForm())
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isEdit, postId, searchParams, user.uid, isAdmin])

  const dirty = useMemo(() => form && initial && JSON.stringify(form) !== JSON.stringify(initial), [form, initial])

  // 작성 중 다른 페이지로 이동하면 확인 창을 띄웁니다.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      Boolean(dirty) && !savedRef.current && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('작성 중인 내용이 저장되지 않았습니다. 페이지를 떠날까요?')) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  // 탭 닫기·새로고침 시 브라우저 기본 확인 창
  useEffect(() => {
    if (!dirty) return
    function onBeforeUnload(e) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validatePost(form)
    setErrors(found)
    if (found.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    const data = normalizePost(form)
    try {
      let id = postId
      if (isEdit) {
        await updatePost(postId, data)
      } else {
        id = await createPost({ ...data, courseId: context.courseId, type: context.type })
      }
      savedRef.current = true
      navigate(`/posts/${id}`, { replace: true })
    } catch (err) {
      setErrors([err.message])
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState message={loadError} />
        <Link to="/courses" className="text-sm text-stone-500 hover:text-stone-900">
          ← 수업 목록으로
        </Link>
      </div>
    )
  }
  if (!form) return <LoadingState />

  const cancelTo = isEdit
    ? `/posts/${postId}`
    : `/courses/${context.courseId}${context.type === 'work' ? '?tab=work' : ''}`

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-stone-500">
        {context.courseTitle} · {TYPE_LABEL[context.type]}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">
        {isEdit ? '글 수정' : context.type === 'work' ? '작품 올리기' : '수업 자료 작성'}
      </h1>

      {errors.length > 0 && (
        <ul className="mt-6 space-y-1 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8" noValidate>
        <div>
          <label htmlFor="post-title" className="label">
            제목 <span className="text-accent">*</span>
          </label>
          <input
            id="post-title"
            className="input"
            value={form.title}
            maxLength={LIMITS.titleMax}
            onChange={(e) => setField('title', e.target.value)}
            required
          />
          <p className="mt-1 text-right text-xs text-stone-400">
            {form.title.length} / {LIMITS.titleMax}
          </p>
        </div>

        <div>
          <label htmlFor="post-content" className="label">
            본문
          </label>
          <textarea
            id="post-content"
            className="input min-h-60 leading-relaxed"
            value={form.content}
            maxLength={LIMITS.contentMax}
            onChange={(e) => setField('content', e.target.value)}
            placeholder={context.type === 'work' ? '작품 의도, 재료, 과정 등을 적어 주세요.' : '수업 내용, 과제 안내 등을 적어 주세요.'}
          />
          <p className="mt-1 text-right text-xs text-stone-400">
            {form.content.length} / {LIMITS.contentMax}
          </p>
        </div>

        <UrlListInput
          id="image-url"
          label="이미지 주소"
          values={form.imageUrls}
          onChange={(v) => setField('imageUrls', v)}
          max={LIMITS.maxImages}
          placeholder="https://… 이미지 주소 또는 Google Drive 공유 링크"
          transform={toDisplayImageUrl}
          showPreview
          help={
            <>
              <p>이미지 파일의 인터넷 주소를 붙여 넣으면 바로 미리보기가 나타납니다.</p>
              <p className="mt-1 font-medium text-stone-700">
                Drive 파일은 '링크가 있는 모든 사용자'로 공유해야 보입니다.
              </p>
              <p className="mt-1">Google Drive 공유 링크는 자동으로 이미지 주소로 바뀝니다.</p>
            </>
          }
        />

        <UrlListInput
          id="link-url"
          label="외부 링크"
          values={form.links}
          onChange={(v) => setField('links', v)}
          max={LIMITS.maxLinks}
          placeholder="https://… (PDF, 노션, Behance 등)"
          help="PDF, 노션, Behance, 유튜브 등 참고 링크를 넣을 수 있습니다."
        />

        <div className="flex gap-2 border-t border-stone-200 pt-6">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중…' : isEdit ? '수정 완료' : '등록하기'}
          </button>
          <Link to={cancelTo} className="btn-outline">
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
