import { useCallback, useEffect, useState } from 'react'
import { listPosts } from '../services/index.js'
import { PAGE_SIZE } from '../config.js'
import { MaterialList, WorkGrid } from './PostCard.jsx'
import { EmptyState, ErrorState, LoadingState } from './StatusMessage.jsx'

// 한 번에 12개씩 불러오고 "더 보기"로 이어서 불러옵니다(무료 요금제 읽기 절약).
export default function PostList({ courseId, type, emptyAction }) {
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const loadFirst = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const page = await listPosts({ courseId, type, pageSize: PAGE_SIZE })
      setItems(page.items)
      setCursor(page.nextCursor)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [courseId, type])

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

  async function loadMore() {
    setLoadingMore(true)
    setError('')
    try {
      const page = await listPosts({ courseId, type, pageSize: PAGE_SIZE, cursor })
      setItems((prev) => [...prev, ...page.items])
      setCursor(page.items.length ? page.nextCursor : null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return <LoadingState />
  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadFirst} />
  if (items.length === 0) {
    return (
      <EmptyState text={type === 'material' ? '아직 등록된 수업 자료가 없습니다.' : '아직 올라온 학생 작품이 없습니다.'}>
        {emptyAction}
      </EmptyState>
    )
  }

  return (
    <div>
      {type === 'work' ? <WorkGrid posts={items} /> : <MaterialList posts={items} />}
      {error && <ErrorState message={error} />}
      {cursor && (
        <div className="mt-10 text-center">
          <button type="button" className="btn-outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  )
}
