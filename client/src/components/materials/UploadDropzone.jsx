import { useRef, useState } from 'react'
import { CloudUpload, LoaderCircle } from 'lucide-react'
import { BACKEND_UNAVAILABLE, uploadDocument } from '../../api/client'
import { ACCEPT_ATTRIBUTE, createUploadedDocument, validateFile } from '../../utils/documents'
import InlineAlert from '../common/InlineAlert'

/**
 * Drag-and-drop / file-picker upload for PDF, TXT, and MD (API_CONTRACT.md POST /api/upload).
 * A document is only added after the backend returns extracted text — failures are never
 * turned into fake successes.
 */
export default function UploadDropzone({ onUploaded }) {
  const inputRef = useRef(null)
  const dragDepth = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingName, setUploadingName] = useState(null)
  const [message, setMessage] = useState(null) // { variant, title, text, retryFile? }

  const isUploading = uploadingName !== null

  async function handleFile(file) {
    const validationError = validateFile(file)
    if (validationError) {
      setMessage({ variant: 'error', title: "That file can't be uploaded", text: validationError })
      return
    }

    setMessage(null)
    setUploadingName(file.name)
    try {
      const result = await uploadDocument(file)
      const doc = createUploadedDocument(result)
      onUploaded(doc)
      setMessage({
        variant: result.truncated ? 'warning' : 'success',
        title: `${result.fileName} is ready to study`,
        text: result.truncated
          ? 'This document was very long, so only the first 100,000 characters were kept. It is now your active study material.'
          : 'It has been added to your library and set as your active study material.',
      })
    } catch (error) {
      setMessage({
        variant: 'error',
        title: error.code === BACKEND_UNAVAILABLE ? 'Upload service unavailable' : 'Upload failed',
        text: error.message,
        retryFile: file,
      })
    } finally {
      setUploadingName(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0 || isUploading) return
    if (fileList.length > 1) {
      setMessage({ variant: 'error', title: 'One file at a time', text: 'Please upload a single file per upload.' })
      return
    }
    handleFile(fileList[0])
  }

  const dragHandlers = {
    onDragEnter(event) {
      event.preventDefault()
      dragDepth.current += 1
      if (!isUploading) setIsDragging(true)
    },
    onDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = isUploading ? 'none' : 'copy'
    },
    onDragLeave(event) {
      event.preventDefault()
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setIsDragging(false)
    },
    onDrop(event) {
      event.preventDefault()
      dragDepth.current = 0
      setIsDragging(false)
      handleFiles(event.dataTransfer.files)
    },
  }

  return (
    <div className="space-y-4">
      <div
        {...dragHandlers}
        aria-busy={isUploading}
        className={`flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition duration-200 ${
          isDragging
            ? 'scale-[1.01] border-lavender-500 bg-lavender-50'
            : 'border-lavender-200 bg-white/70 hover:border-lavender-300'
        }`}
      >
        <span
          className={`mb-4 grid size-14 place-items-center rounded-2xl transition ${
            isDragging ? 'bg-lavender-600 text-white' : 'bg-lavender-50 text-lavender-500'
          }`}
        >
          {isUploading ? (
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          ) : (
            <CloudUpload className="size-7" aria-hidden="true" />
          )}
        </span>

        {isUploading ? (
          <div role="status" aria-live="polite">
            <p className="font-semibold text-ink-900">Uploading {uploadingName}…</p>
            <p className="mt-1 text-sm text-ink-500">Extracting text. This can take a few seconds.</p>
          </div>
        ) : (
          <>
            <p className="font-semibold text-ink-900">
              {isDragging ? 'Drop your file to upload' : 'Drag and drop a file, or choose one'}
            </p>
            <p className="mt-1 text-sm text-ink-500">PDF, TXT, or MD &middot; up to 10 MB</p>
          </>
        )}

        <input
          ref={inputRef}
          id="material-file-input"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-lavender-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-lavender-700 hover:shadow-lift disabled:cursor-not-allowed disabled:bg-lavender-300 disabled:shadow-none"
        >
          {isUploading ? 'Uploading…' : 'Choose file'}
        </button>
      </div>

      {message && (
        <InlineAlert
          variant={message.variant}
          title={message.title}
          onDismiss={() => setMessage(null)}
          action={
            message.retryFile && (
              <button
                type="button"
                onClick={() => handleFile(message.retryFile)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
              >
                Try again
              </button>
            )
          }
        >
          {message.text}
        </InlineAlert>
      )}
    </div>
  )
}
