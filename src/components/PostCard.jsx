import { Link } from 'react-router'
import ImageWithFallback from './ImageWithFallback.jsx'
import { formatDate } from '../utils/formatDate.js'

function CommentBadge({ count }) {
  if (!count) return null
  return <span aria-label={`댓글 ${count}개`}>댓글 {count}</span>
}

// 학생 작품: 이미지 중심 카드
export function WorkCard({ post }) {
  const cover = post.imageUrls?.[0]
  return (
    <Link to={`/posts/${post.id}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden bg-stone-100">
        {cover ? (
          <ImageWithFallback
            src={cover}
            alt={`${post.title} 대표 이미지`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">이미지 없음</div>
        )}
      </div>
      <h3 className="mt-3 line-clamp-1 font-medium text-stone-900 group-hover:underline group-hover:underline-offset-4">
        {post.title}
      </h3>
      <p className="mt-1 flex gap-3 text-xs text-stone-500">
        <span>{post.authorName}</span>
        <CommentBadge count={post.commentCount} />
      </p>
    </Link>
  )
}

// 수업 자료: 텍스트 목록 한 줄
export function MaterialRow({ post }) {
  return (
    <li className="border-b border-stone-200">
      <Link
        to={`/posts/${post.id}`}
        className="flex flex-col gap-1 py-4 hover:bg-stone-50 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-2"
      >
        <span className="font-medium text-stone-900">{post.title}</span>
        <span className="flex shrink-0 gap-3 text-xs text-stone-500">
          <time>{formatDate(post.createdAt)}</time>
          <CommentBadge count={post.commentCount} />
        </span>
      </Link>
    </li>
  )
}

export function WorkGrid({ posts }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <WorkCard post={post} />
        </li>
      ))}
    </ul>
  )
}

export function MaterialList({ posts }) {
  return (
    <ul className="border-t border-stone-200">
      {posts.map((post) => (
        <MaterialRow key={post.id} post={post} />
      ))}
    </ul>
  )
}
