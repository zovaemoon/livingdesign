import { useState } from 'react'
import { LIMITS, validateCourse } from '../utils/validate.js'

// 수업 추가/수정에 함께 쓰는 폼
export default function CourseForm({ initial, submitLabel = '저장', onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [semester, setSemester] = useState(initial?.semester || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { title, semester, description }
    const found = validateCourse(data)
    setErrors(found)
    if (found.length) return
    setSaving(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setErrors([err.message])
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-stone-200 p-5 sm:p-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
        <div>
          <label htmlFor="course-title" className="label">
            수업 이름 <span className="text-accent">*</span>
          </label>
          <input
            id="course-title"
            className="input"
            value={title}
            maxLength={LIMITS.titleMax}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="course-semester" className="label">
            학기
          </label>
          <input
            id="course-semester"
            className="input"
            placeholder="예: 2026-2"
            value={semester}
            maxLength={LIMITS.semesterMax}
            onChange={(e) => setSemester(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="course-description" className="label">
          수업 설명
        </label>
        <textarea
          id="course-description"
          className="input min-h-28"
          value={description}
          maxLength={LIMITS.courseDescriptionMax}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {errors.length > 0 && (
        <ul className="space-y-1 text-sm text-red-700" role="alert">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? '저장 중…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel} disabled={saving}>
            취소
          </button>
        )}
      </div>
    </form>
  )
}
