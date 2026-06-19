const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') ?? ''

export function apiUrl(path: string) {
  if (!apiBaseUrl) return path
  return new URL(path, `${apiBaseUrl}/`).toString()
}