import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-stone-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm text-stone-600">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <Link to="/" className="btn-outline mt-8">
        홈으로 가기
      </Link>
    </section>
  )
}
