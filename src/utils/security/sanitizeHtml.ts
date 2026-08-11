import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}

export function htmlToPlainText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  })
}
