import { instagramShortcode } from '@/lib/instagramShop'

function unescapeIgUrl(raw) {
  return String(raw || '')
    .replace(/\\u0026/gi, '&')
    .replace(/\\+\//g, '/')
    .replace(/\\\//g, '/')
}

/** Pull thumbnail + video mp4 from Instagram embed HTML. */
export async function fetchEmbedMedia(permalink) {
  const code = instagramShortcode(permalink)
  if (!code) return { thumbnail: '', videoUrl: '' }

  // Mobile UA returns classic embed HTML that includes video_url; desktop often does not.
  const urls = [
    `https://www.instagram.com/reel/${code}/embed/`,
    `https://www.instagram.com/p/${code}/embed/`,
    `https://www.instagram.com/p/${code}/embed/captioned/`,
  ]

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
      })
      if (!res.ok) continue
      const html = await res.text()

      let videoUrl = ''
      const videoIdx = html.indexOf('video_url')
      if (videoIdx !== -1) {
        const slice = html.slice(videoIdx, videoIdx + 2500)
        const httpsIdx = slice.indexOf('https:')
        if (httpsIdx !== -1) {
          let raw = ''
          for (let i = httpsIdx; i < slice.length; i++) {
            const c = slice[i]
            if (c === '\\' && i + 1 < slice.length) {
              const n = slice[i + 1]
              if (n === '/') {
                raw += '/'
                i++
                continue
              }
              if (n === 'u' && slice.slice(i + 2, i + 6) === '0026') {
                raw += '&'
                i += 5
                continue
              }
              if (n === '"') break
              raw += n
              i++
              continue
            }
            if (c === '"') break
            raw += c
          }
          videoUrl = unescapeIgUrl(raw)
          if (!videoUrl.includes('.mp4')) videoUrl = ''
        }
      }

      let thumbnail = ''
      const thumbPatterns = [
        /display_url\\":\\"(https:[^"\\]+)\\"/i,
        /class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i,
        /property="og:image"\s+content="([^"]+)"/i,
        /content="([^"]+)"\s+property="og:image"/i,
        /"(https:\/\/scontent[^"]+\.(?:jpg|jpeg|webp)[^"]*)"/i,
      ]
      for (const re of thumbPatterns) {
        const m = html.match(re)
        if (m?.[1]) {
          thumbnail = unescapeIgUrl(m[1].replace(/&amp;/g, '&'))
          break
        }
      }

      if (videoUrl || thumbnail) return { thumbnail, videoUrl }
    } catch {
      /* try next */
    }
  }
  return { thumbnail: '', videoUrl: '' }
}
