import { isHttpUrl } from '../utils/validate.js'
import ImageWithFallback from './ImageWithFallback.jsx'

// 이미지 주소 / 외부 링크를 여러 줄로 입력받는 칸. transform 으로 입력값을 바로 바꿀 수 있습니다.
export default function UrlListInput({ id, label, values, onChange, max, placeholder, transform, showPreview, help }) {
  function update(i, value) {
    const next = [...values]
    next[i] = transform ? transform(value) : value
    onChange(next)
  }

  function remove(i) {
    onChange(values.filter((_, idx) => idx !== i))
  }

  return (
    <fieldset>
      <legend className="label">
        {label} <span className="font-normal text-stone-400">(최대 {max}개)</span>
      </legend>
      {help && <div className="mb-3 text-xs leading-relaxed text-stone-500">{help}</div>}
      <ul className="space-y-3">
        {values.map((value, i) => {
          const trimmed = value.trim()
          const invalid = trimmed !== '' && !isHttpUrl(trimmed)
          return (
            <li key={i} className="flex gap-3">
              {showPreview && (
                <div className="h-16 w-20 shrink-0 overflow-hidden bg-stone-100">
                  {trimmed && !invalid ? (
                    <ImageWithFallback src={trimmed} alt={`미리보기 ${i + 1}`} className="h-full w-full object-cover text-[10px]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-stone-400">미리보기</div>
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex gap-2">
                  <label htmlFor={`${id}-${i}`} className="sr-only">
                    {label} {i + 1}
                  </label>
                  <input
                    id={`${id}-${i}`}
                    type="url"
                    inputMode="url"
                    className="input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => update(i, e.target.value)}
                    aria-invalid={invalid}
                  />
                  <button type="button" className="btn-outline shrink-0 px-3" onClick={() => remove(i)} aria-label={`${label} ${i + 1} 지우기`}>
                    삭제
                  </button>
                </div>
                {invalid && <p className="mt-1 text-xs text-red-700">http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.</p>}
              </div>
            </li>
          )
        })}
      </ul>
      {values.length < max && (
        <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => onChange([...values, ''])}>
          + {label} 추가
        </button>
      )}
    </fieldset>
  )
}
