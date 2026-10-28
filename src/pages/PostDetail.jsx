import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { deletePost, getCourse, getPost } from '../services/index.js'
import { formatDate } from '../utils/formatDate.js'
import { isHttpUrl } from '../utils/validate.js'
import Avatar from '../components/Avatar.jsx'
import CommentList from '../components/CommentList.jsx'
import ImageWithFallback from '../components/ImageWithFallback.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { ErrorState, LoadingState } from '../components/StatusMessage.jsx'
import NotFound from './NotFound.jsx'

function linkLabel(url) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '') + (u.pathname.length > 1 ? u.pathname : '')
  } catch {
    return url
  }
}

export default function PostDetail() {
  const { postId } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(undefined)
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const load = useCallback(async () => {
    setError('')
    setPost(undefined)
    try {
      const p = await getPost(postId)
      setPost(p)
      if (p) setCourse(await getCourse(p.courseId))
    } catch (err) {
      setError(err.message)
    }
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!window.confirm('이 게시물을 삭제할까요? 댓글도 함께 삭제됩니다.')) return
    setDeleting(true)
    setActionError('')
    try {
      await deletePost(postId)
      navigate(`/courses/${post.courseId}${post.type === 'work' ? '?tab=work' : ''}`, { replace: true })
    } catch (err) {
      setActionError(err.message)
      setDeleting(false)
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (post === undefined) return <LoadingState />
  if (post === null) return <NotFound />

  const canEdit = user && (post.authorId === user.uid || isAdmin)
  // 저장할 때 검증하지만, 혹시 모를 javascript: 링크를 화면에서도 한 번 더 걸러 냅니다.
  const images = (post.imageUrls || []).filter(isHttpUrl)
  const links = (post.links || []).filter(isHttpUrl)

  return (
    <article className="mx-auto max-w-4xl">
      <nav className="text-sm text-stone-500" aria-label="위치">
        {course ? (
          <Link to={`/courses/${course.id}${post.type === 'work' ? '?tab=work' : ''}`} className="hover:text-stone-900">
            ← {course.title} · {post.type === 'work' ? '학생 작품' : '수업 자료'}
          </Link>
        ) : (
          <Link to="/courses" className="hover:text-stone-900">
            ← 수업 목록
          </Link>
        )}
      </nav>

      <header className="mt-6 border-b border-stone-200 pb-6">
        <p className="eyebrow">{post.type === 'work' ? 'Student Work' : 'Course Material'}</p>
        <h1 className="mt-3 text-2xl leading-snug font-semibold tracking-tight break-words text-stone-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="flex items-center gap-2 text-sm text-stone-700">
            <Avatar name={post.authorName} photoURL={post.authorPhoto} />
            {post.authorName}
          </span>
          <time className="text-sm text-stone-400">
            {formatDate(post.createdAt)}
            {post.updatedAt && post.createdAt && post.updatedAt - post.createdAt > 60000 && ' (수정됨)'}
          </time>
          {canEdit && (
            <span className="ml-auto flex gap-2">
              <Link to={`/posts/${post.id}/edit`} className="btn-outline px-3 py-1.5">
                수정
              </Link>
              <button type="button" className="btn-danger px-3 py-1.5" onClick={handleDelete} disabled={deleting}>
                {deleting ? '삭제 중…' : '삭제'}
              </button>
            </span>
          )}
        </div>
        {actionError && <ErrorState message={actionError} />}
      </header>

      {images.length > 0 && (
        <div className="mt-8 space-y-4">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className="block w-full cursor-zoom-in bg-stone-50"
              onClick={() => setLightboxIndex(i)}
              aria-label={`이미지 ${i + 1} 크게 보기`}
            >
              <ImageWithFallback
                src={src}
                alt={`${post.title} 이미지 ${i + 1}`}
                className="mx-auto max-h-[80vh] w-auto max-w-full object-contain min-h-48"
              />
            </button>
          ))}
        </div>
      )}

      {post.content && (
        <div className="mt-10 text-base leading-loose break-words whitespace-pre-wrap text-stone-700">{post.content}</div>
      )}

      {links.length > 0 && (
        <section className="mt-10" aria-labelledby="links-heading">
          <h2 id="links-heading" className="eyebrow">
            Links
          </h2>
          <ul className="mt-3 divide-y divide-stone-100 border-y border-stone-200">
            {links.map((url, i) => (
              <li key={`${url}-${i}`}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 py-3 text-sm text-stone-700 hover:text-accent"
                >
                  <span className="truncate">{linkLabel(url)}</span>
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only">(새 창에서 열림)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CommentList postId={post.id} />

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          alt={post.title}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </article>
  )
}
