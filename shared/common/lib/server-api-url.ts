import { headers } from 'next/headers'

export async function getServerApiUrl(pathname: string): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto =
    h.get('x-forwarded-proto') ??
    (host && (host.includes('localhost') || host.startsWith('127.0.0.1')) ? 'http' : 'https')

  if (!host) {
    throw new Error('Host header topilmadi')
  }

  return `${proto}://${host}${pathname}`
}
