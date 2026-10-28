import { useEffect, useState } from 'react'
import { addComment, deleteComment, subscribeComments } from '../services/index.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatDateTime } from '../utils/formatDate.js'
import { LIMITS, validateComment } from '../utils/validate.js'
import Avatar from './Avatar.jsx'
import { ErrorState, LoadingState } from './StatusMessage.jsx'

export default function CommentList({ postId }) {
  const { user, isAdmin } = useAuth()
  const [comments, setComments] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [text, setText] = useState('')
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // 실시간 리스너는 이 화면에서만 쓰고, 화면을 떠나면 반드시 해제합니다(읽기 비용 절약).
  useEffect(() => {
    setComments(null)
    setLoadError('')
    const unsubscribe = subscribeComments(
      postId,
      (list) => setComments(list),
      (err) => setLoadError(err.message),
    )
    return unsubscribe
  }, [postId])

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validateComment(text)
    if (errors.length) {
      setFormError(errors[0])
      return
    }
    setSending(true)
    setFormError('')
    try {
      await addComment(postId, text)
      setText('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    setDeletingId(commentId)
    try {
      await deleteComment(postId, commentId)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-16 border-t border-stone-200 pt-10">
      <h2 id="comments-heading" className="text-lg font-semibold text-stone-900">
        토론 {comments && <span className="text-stone-400">{comments.length}</span>}
      </h2>

      {loadError && <ErrorState message={loadError} />}
      {!comments && !loadError && <LoadingState text="댓글을 불러오는 중…" />}
      {comments && comments.length === 0 && (
        <p className="mt-6 text-sm text-stone-500">아직 댓글이 없습니다. 첫 의견을 남겨 보세요.</p>
      )}
      {comments && comments.length > 0 && (
        <ul className="mt-6 divide-y divide-stone-100">
          {comments.map((c) => {
            const canDelete = user && (c.authorId === user.uid || isAdmin)
            return (
              <li key={c.id} className="flex gap-3 py-5">
                <Avatar name={c.authorName} photoURL={c.authorPhoto} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-sm font-medium text-stone-900">{c.authorName}</span>
                    <time className="text-xs text-stone-400">{formatDateTime(c.createdAt)}</time>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="ml-auto text-xs text-stone-400 hover:text-red-600"
                        aria-label={`${c.authorName}님의 댓글 삭제`}
                      >
                        {deletingId === c.id ? '삭제 중…' : '삭제'}
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-stone-700">
                    {c.content}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-8" noValidate>
        <label htmlFor="comment-input" className="sr-only">
          댓글 입력
        </label>
        <textarea
          id="comment-input"
          className="input min-h-24"
          placeholder="작품에 대한 의견이나 질문을 남겨 주세요."
          value={text}
          maxLength={LIMITS.commentMax}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400">
            {text.length} / {LIMITS.commentMax}
          </span>
          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? '등록 중…' : '댓글 등록'}
          </button>
        </div>
        {formError && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        )}
      </form>
    </section>
  )
}
