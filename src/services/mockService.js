// 데모 모드용 서비스: 모든 데이터를 이 브라우저의 localStorage 에 저장합니다.
// firebaseService.js 와 함수 이름·인자·반환값이 같아야 합니다.
import { PAGE_SIZE } from '../config.js'

const DB_KEY = 'ldl-demo-db-v1'
const USER_KEY = 'ldl-demo-user-v1'

const DEMO_USERS = {
  professor: {
    uid: 'demo-professor',
    displayName: '김리빙 교수',
    email: 'professor@demo.local',
    photoURL: '',
    isAdmin: true,
  },
  student: {
    uid: 'demo-student',
    displayName: '이디자인 학생',
    email: 'student@demo.local',
    photoURL: '',
    isAdmin: false,
  },
}

const authListeners = new Set()
const commentListeners = new Map()

function wait(ms = 150) {
  // 실제 서버처럼 약간 늦게 응답해야 로딩 화면도 확인할 수 있습니다.
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

// 샘플 이미지 (picsum.photos 의 고정 사진 번호)
function picsum(id) {
  return `https://picsum.photos/id/${id}/1200/900`
}

function buildSeed() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const prof = DEMO_USERS.professor
  const author = (u) => ({ authorId: u.uid, authorName: u.displayName, authorPhoto: u.photoURL })
  const students = [
    { uid: 'demo-s1', displayName: '박서윤', photoURL: '' },
    { uid: 'demo-s2', displayName: '최민준', photoURL: '' },
    { uid: 'demo-s3', displayName: '정하은', photoURL: '' },
    DEMO_USERS.student,
  ]

  const courses = [
    {
      id: 'course-furniture',
      title: '공간과 가구 디자인 스튜디오',
      semester: '2026-2',
      description:
        '작은 주거 공간을 위한 가구를 리서치하고 1:5 모형과 1:1 프로토타입으로 제안합니다.\n매주 크리틱을 통해 형태, 구조, 사용 맥락을 함께 검토합니다.',
      createdAt: now - 40 * day,
      createdBy: prof.uid,
    },
    {
      id: 'course-object',
      title: '리빙 오브제 리서치',
      semester: '2026-2',
      description:
        '식탁 위, 욕실, 창가 등 생활 장면을 관찰하고 그 안의 오브제를 재해석합니다.\n재료 실험과 사진 기록을 중심으로 진행합니다.',
      createdAt: now - 38 * day,
      createdBy: prof.uid,
    },
  ]

  const post = (id, courseId, type, title, content, imageUrls, links, user, daysAgo) => ({
    id,
    courseId,
    type,
    title,
    content,
    imageUrls,
    links,
    ...author(user),
    commentCount: 0,
    createdAt: now - daysAgo * day,
    updatedAt: now - daysAgo * day,
  })

  const posts = [
    post('post-m1', 'course-furniture', 'material', '1주차: 작은 집을 위한 가구 리서치 방법',
      '이번 주 과제는 1인 가구의 생활 동선을 관찰하고 기록하는 것입니다.\n\n1. 하루 동안 가장 많이 사용하는 가구 3개를 고르세요.\n2. 사용 장면을 사진으로 기록하세요.\n3. 불편한 점을 키워드로 정리해 오세요.',
      [picsum(311)], ['https://www.notion.so/'], prof, 30),
    post('post-m2', 'course-furniture', 'material', '중간 크리틱 안내 및 평가 기준',
      '중간 크리틱은 10월 셋째 주에 진행합니다.\n1:5 모형과 A2 패널 1장을 준비해 주세요.\n\n평가 기준: 리서치의 깊이, 형태 완성도, 구조 이해, 발표.',
      [], ['https://example.com/critique-guide.pdf'], prof, 20),
    post('post-m3', 'course-object', 'material', '재료 실험 레퍼런스 모음',
      '도자, 목재, 패브릭, 재생 플라스틱 등 재료 실험 사례를 모았습니다.\n각자 관심 있는 재료를 하나 골라 다음 주까지 샘플 3개를 만들어 오세요.',
      [picsum(307), picsum(312)], ['https://www.behance.net/'], prof, 15),
    post('post-w1', 'course-furniture', 'work', '접이식 벽걸이 책상', '좁은 원룸에서 쓰지 않을 때는 벽에 붙여 접어 두는 책상입니다.\n자작나무 합판과 황동 경첩을 사용했습니다.',
      [picsum(42), picsum(48)], [], students[0], 10),
    post('post-w2', 'course-furniture', 'work', '모듈형 수납 스툴', '스툴 세 개를 쌓으면 선반이 되는 모듈형 가구입니다.',
      [picsum(305)], ['https://www.behance.net/'], students[1], 8),
    post('post-w3', 'course-furniture', 'work', '창가 데이베드 스케치 모형', '창가에서 낮잠과 독서를 함께 할 수 있는 데이베드의 1:5 모형입니다.',
      [picsum(192)], [], students[2], 6),
    post('post-w4', 'course-object', 'work', '흙으로 만든 조명 갓', '조명 갓의 두께에 따라 빛이 어떻게 달라지는지 실험했습니다.',
      [picsum(365), picsum(326), picsum(30)], [], students[0], 5),
    post('post-w5', 'course-object', 'work', '욕실 선반 오브제', '물기가 잘 빠지도록 경사를 준 도자 선반입니다.',
      [picsum(63)], [], students[1], 3),
    post('post-w6', 'course-object', 'work', '식탁 위 패브릭 트레이', '버려지는 원단을 겹쳐 만든 가벼운 트레이 시리즈입니다.',
      [picsum(36)], [], students[2], 2),
  ]

  const commentsByPost = {
    'post-w1': [
      { id: 'c1', content: '경첩 부분 디테일이 좋네요. 접었을 때 두께는 얼마나 되나요?', ...author(prof), createdAt: now - 9 * day },
      { id: 'c2', content: '약 45mm입니다! 다음 주에 단면도도 올리겠습니다.', ...author(students[0]), createdAt: now - 9 * day + 3600000 },
    ],
    'post-w4': [
      { id: 'c3', content: '두께별 사진을 나란히 비교하면 더 잘 보일 것 같아요.', ...author(students[1]), createdAt: now - 4 * day },
    ],
    'post-m2': [
      { id: 'c4', content: '패널은 출력해서 가져가야 하나요?', ...author(students[2]), createdAt: now - 19 * day },
      { id: 'c5', content: '네, 출력본과 PDF 모두 준비해 주세요.', ...author(prof), createdAt: now - 19 * day + 7200000 },
    ],
  }

  const comments = {}
  for (const [postId, list] of Object.entries(commentsByPost)) {
    comments[postId] = list
    posts.find((p) => p.id === postId).commentCount = list.length
  }

  const users = {}
  for (const u of [prof, ...students]) {
    users[u.uid] = { displayName: u.displayName, email: u.email || '', photoURL: u.photoURL, createdAt: now - 40 * day }
  }

  return { users, courses, posts, comments }
}

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // 저장된 값이 깨졌으면 아래에서 새로 만듭니다.
  }
  const seed = buildSeed()
  saveDb(seed)
  return seed
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function requireUser() {
  const user = getCurrentUser()
  if (!user) throw new Error('로그인이 필요합니다.')
  return user
}

function requireAdmin() {
  const user = requireUser()
  if (!user.isAdmin) throw new Error('교수(관리자)만 할 수 있는 작업입니다.')
  return user
}

function notifyAuth() {
  const user = getCurrentUser()
  authListeners.forEach((cb) => cb(user))
}

function sortedComments(db, postId) {
  return clone(db.comments[postId] || []).sort((a, b) => a.createdAt - b.createdAt)
}

function notifyComments(postId) {
  const listeners = commentListeners.get(postId)
  if (!listeners) return
  const list = sortedComments(loadDb(), postId)
  listeners.forEach((cb) => cb(list))
}

function paginate(list, pageSize, cursor) {
  const start = cursor || 0
  const items = list.slice(start, start + pageSize)
  const next = start + pageSize
  return { items: clone(items), nextCursor: next < list.length ? next : null }
}

// ── 인증 ─────────────────────────────────────────

export const isDemo = true

export function onAuthChange(cb) {
  authListeners.add(cb)
  cb(getCurrentUser())
  return () => authListeners.delete(cb)
}

export async function signInWithGoogle() {
  throw new Error('데모 모드에서는 Google 로그인을 사용할 수 없습니다. 데모 로그인 버튼을 눌러 주세요.')
}

// 데모 모드 전용: role 은 'professor' 또는 'student'
export async function demoSignIn(role) {
  await wait()
  const user = DEMO_USERS[role]
  if (!user) throw new Error('알 수 없는 데모 계정입니다.')
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  const db = loadDb()
  if (!db.users[user.uid]) {
    db.users[user.uid] = { displayName: user.displayName, email: user.email, photoURL: user.photoURL, createdAt: Date.now() }
    saveDb(db)
  }
  notifyAuth()
  return clone(user)
}

export async function signOut() {
  localStorage.removeItem(USER_KEY)
  notifyAuth()
}

// 데모 데이터를 처음 상태로 되돌립니다.
export async function resetDemoData() {
  saveDb(buildSeed())
}

// ── 수업 ─────────────────────────────────────────

export async function listCourses({ pageSize = PAGE_SIZE, cursor = null } = {}) {
  await wait()
  requireUser()
  const list = [...loadDb().courses].sort((a, b) => b.createdAt - a.createdAt)
  return paginate(list, pageSize, cursor)
}

export async function getCourse(id) {
  await wait()
  requireUser()
  const course = loadDb().courses.find((c) => c.id === id)
  return course ? clone(course) : null
}

export async function createCourse(data) {
  await wait()
  const user = requireAdmin()
  const db = loadDb()
  const course = {
    id: newId('course'),
    title: data.title.trim(),
    semester: (data.semester || '').trim(),
    description: data.description || '',
    createdAt: Date.now(),
    createdBy: user.uid,
  }
  db.courses.push(course)
  saveDb(db)
  return course.id
}

export async function updateCourse(id, data) {
  await wait()
  requireAdmin()
  const db = loadDb()
  const course = db.courses.find((c) => c.id === id)
  if (!course) throw new Error('수업을 찾을 수 없습니다.')
  course.title = data.title.trim()
  course.semester = (data.semester || '').trim()
  course.description = data.description || ''
  saveDb(db)
}

export async function deleteCourse(id) {
  await wait()
  requireAdmin()
  const db = loadDb()
  if (db.posts.some((p) => p.courseId === id)) {
    throw new Error('이 수업에 게시물이 남아 있어 삭제할 수 없습니다. 게시물을 먼저 모두 삭제해 주세요.')
  }
  db.courses = db.courses.filter((c) => c.id !== id)
  saveDb(db)
}

// ── 게시물 ───────────────────────────────────────

export async function listPosts({ courseId, type, pageSize = PAGE_SIZE, cursor = null }) {
  await wait()
  requireUser()
  const list = loadDb()
    .posts.filter((p) => p.courseId === courseId && p.type === type)
    .sort((a, b) => b.createdAt - a.createdAt)
  return paginate(list, pageSize, cursor)
}

export async function listRecentPosts(type, n) {
  await wait()
  requireUser()
  const list = loadDb()
    .posts.filter((p) => p.type === type)
    .sort((a, b) => b.createdAt - a.createdAt)
  return clone(list.slice(0, n))
}

export async function getPost(id) {
  await wait()
  requireUser()
  const p = loadDb().posts.find((x) => x.id === id)
  return p ? clone(p) : null
}

export async function createPost(data) {
  await wait()
  const user = data.type === 'material' ? requireAdmin() : requireUser()
  const db = loadDb()
  if (!db.courses.some((c) => c.id === data.courseId)) throw new Error('수업을 찾을 수 없습니다.')
  const now = Date.now()
  const post = {
    id: newId('post'),
    courseId: data.courseId,
    type: data.type,
    title: data.title,
    content: data.content,
    imageUrls: data.imageUrls,
    links: data.links,
    authorId: user.uid,
    authorName: user.displayName,
    authorPhoto: user.photoURL,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  db.posts.push(post)
  saveDb(db)
  return post.id
}

function requireOwnerOrAdmin(db, postId) {
  const user = requireUser()
  const p = db.posts.find((x) => x.id === postId)
  if (!p) throw new Error('게시물을 찾을 수 없습니다.')
  if (p.authorId !== user.uid && !user.isAdmin) throw new Error('작성자 또는 교수만 할 수 있는 작업입니다.')
  return p
}

export async function updatePost(id, data) {
  await wait()
  const db = loadDb()
  const p = requireOwnerOrAdmin(db, id)
  p.title = data.title
  p.content = data.content
  p.imageUrls = data.imageUrls
  p.links = data.links
  p.updatedAt = Date.now()
  saveDb(db)
}

export async function deletePost(id) {
  await wait()
  const db = loadDb()
  requireOwnerOrAdmin(db, id)
  db.posts = db.posts.filter((p) => p.id !== id)
  delete db.comments[id]
  saveDb(db)
}

// ── 댓글 ─────────────────────────────────────────

export async function listComments(postId) {
  await wait()
  requireUser()
  return sortedComments(loadDb(), postId)
}

// 실시간 구독 흉내: 댓글이 바뀔 때마다 onData 가 다시 호출됩니다. 반환값을 호출하면 구독 해제.
export function subscribeComments(postId, onData) {
  if (!commentListeners.has(postId)) commentListeners.set(postId, new Set())
  commentListeners.get(postId).add(onData)
  wait().then(() => {
    if (commentListeners.get(postId)?.has(onData)) onData(sortedComments(loadDb(), postId))
  })
  return () => {
    const listeners = commentListeners.get(postId)
    listeners?.delete(onData)
    if (listeners?.size === 0) commentListeners.delete(postId)
  }
}

export async function addComment(postId, content) {
  await wait()
  const user = requireUser()
  const db = loadDb()
  const p = db.posts.find((x) => x.id === postId)
  if (!p) throw new Error('게시물을 찾을 수 없습니다.')
  const comment = {
    id: newId('comment'),
    content: content.trim(),
    authorId: user.uid,
    authorName: user.displayName,
    authorPhoto: user.photoURL,
    createdAt: Date.now(),
  }
  db.comments[postId] = [...(db.comments[postId] || []), comment]
  p.commentCount = (p.commentCount || 0) + 1
  saveDb(db)
  notifyComments(postId)
  return comment.id
}

export async function deleteComment(postId, commentId) {
  await wait()
  const user = requireUser()
  const db = loadDb()
  const list = db.comments[postId] || []
  const comment = list.find((c) => c.id === commentId)
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.')
  if (comment.authorId !== user.uid && !user.isAdmin) throw new Error('작성자 또는 교수만 삭제할 수 있습니다.')
  db.comments[postId] = list.filter((c) => c.id !== commentId)
  const p = db.posts.find((x) => x.id === postId)
  if (p) p.commentCount = Math.max(0, (p.commentCount || 0) - 1)
  saveDb(db)
  notifyComments(postId)
}
