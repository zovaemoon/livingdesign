import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from './hooks/useAuth.js'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import PostDetail from './pages/PostDetail.jsx'
import PostEditor from './pages/PostEditor.jsx'
import NotFound from './pages/NotFound.jsx'

// 작성 중 이탈 확인(useBlocker)을 쓰려면 data router(createBrowserRouter)가 필요합니다.
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/courses', element: <Courses /> },
          { path: '/courses/:courseId', element: <CourseDetail /> },
          { path: '/posts/new', element: <PostEditor /> },
          { path: '/posts/:postId', element: <PostDetail /> },
          { path: '/posts/:postId/edit', element: <PostEditor /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
