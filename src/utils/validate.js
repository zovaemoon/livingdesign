export const LIMITS = {
  titleMax: 100,
  contentMax: 5000,
  commentMax: 1000,
  semesterMax: 20,
  courseDescriptionMax: 2000,
  maxImages: 5,
  maxLinks: 5,
}

export function isHttpUrl(value) {
  try {
    const url = new URL(String(value).trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function cleanList(list) {
  return (list || []).map((v) => String(v).trim()).filter(Boolean)
}

// 오류가 없으면 빈 배열을 돌려줍니다.
export function validatePost({ title, content, imageUrls, links }) {
  const errors = []
  const t = (title || '').trim()
  if (t.length < 1) errors.push('제목을 입력해 주세요.')
  if (t.length > LIMITS.titleMax) errors.push(`제목은 ${LIMITS.titleMax}자 이하로 입력해 주세요.`)
  if ((content || '').length > LIMITS.contentMax) {
    errors.push(`본문은 ${LIMITS.contentMax}자 이하로 입력해 주세요.`)
  }
  const images = cleanList(imageUrls)
  if (images.length > LIMITS.maxImages) errors.push(`이미지는 최대 ${LIMITS.maxImages}개까지 넣을 수 있습니다.`)
  if (images.some((u) => !isHttpUrl(u))) errors.push('이미지 주소는 http:// 또는 https:// 로 시작해야 합니다.')
  const linkList = cleanList(links)
  if (linkList.length > LIMITS.maxLinks) errors.push(`링크는 최대 ${LIMITS.maxLinks}개까지 넣을 수 있습니다.`)
  if (linkList.some((u) => !isHttpUrl(u))) errors.push('링크 주소는 http:// 또는 https:// 로 시작해야 합니다.')
  return errors
}

export function validateComment(content) {
  const text = (content || '').trim()
  if (text.length < 1) return ['댓글 내용을 입력해 주세요.']
  if (text.length > LIMITS.commentMax) return [`댓글은 ${LIMITS.commentMax}자 이하로 입력해 주세요.`]
  return []
}

export function validateCourse({ title, semester, description }) {
  const errors = []
  const t = (title || '').trim()
  if (t.length < 1) errors.push('수업 이름을 입력해 주세요.')
  if (t.length > LIMITS.titleMax) errors.push(`수업 이름은 ${LIMITS.titleMax}자 이하로 입력해 주세요.`)
  if ((semester || '').trim().length > LIMITS.semesterMax) errors.push('학기는 20자 이하로 입력해 주세요.')
  if ((description || '').length > LIMITS.courseDescriptionMax) {
    errors.push(`수업 설명은 ${LIMITS.courseDescriptionMax}자 이하로 입력해 주세요.`)
  }
  return errors
}

// 저장 직전에 공백과 빈 칸을 정리합니다.
export function normalizePost({ title, content, imageUrls, links }) {
  return {
    title: (title || '').trim(),
    content: content || '',
    imageUrls: cleanList(imageUrls),
    links: cleanList(links),
  }
}
