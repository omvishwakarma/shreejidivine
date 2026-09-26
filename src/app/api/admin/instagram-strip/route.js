import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect, requireAdmin } from '@/lib/mongo/auth'
import { StoreSettings, STORE_SETTINGS_DEFAULTS } from '@/lib/mongo/StoreSettings'
import {
  INSTAGRAM_STRIP_DEFAULTS,
  instagramStripCopy,
  normalizeInstagramStripPosts,
} from '@/lib/instagramStrip'
import { CURATED_INSTAGRAM_FEED } from '@/lib/instagramFeed'
import { instagramShortcode } from '@/lib/instagramShop'

const postSchema = z.object({
  id: z.string().max(80).optional(),
  image: z.string().max(800).optional().default(''),
  video: z.string().max(800).optional().default(''),
  permalink: z.string().min(8).max(400),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

function defaultPosts() {
  return CURATED_INSTAGRAM_FEED.map((item, index) => ({
    id: item.id || instagramShortcode(item.permalink) || `strip-${index}`,
    image: '',
    video: '',
    permalink: item.permalink,
    active: true,
    sortOrder: index,
  }))
}

function payload(settings) {
  const copy = instagramStripCopy(settings)
  const saved = settings.instagramStripPosts || []
  return {
    ...copy,
    posts: saved.length ? saved : defaultPosts(),
    usingDefaults: saved.length === 0,
    defaults: INSTAGRAM_STRIP_DEFAULTS,
  }
}

export async function GET(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  await dbConnect()
  let doc = await StoreSettings.findOne({ key: 'default' })
  if (!doc) {
    doc = await StoreSettings.create({ key: 'default', ...STORE_SETTINGS_DEFAULTS })
  }
  return NextResponse.json(payload(doc.toJSONSafe()))
}

export async function PUT(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const schema = z.object({
      label: z.string().max(80).optional(),
      handle: z.string().max(80).optional(),
      url: z.string().max(300).optional(),
      cta: z.string().max(40).optional(),
      posts: z.array(postSchema).max(12),
    })
    const data = schema.parse(await request.json())
    const posts = normalizeInstagramStripPosts(
      data.posts.map((post, index) => ({
        ...post,
        id: post.id || instagramShortcode(post.permalink) || `strip-${index}`,
        sortOrder: post.sortOrder ?? index,
      }))
    )

    const $set = { instagramStripPosts: posts }
    if (data.label !== undefined) $set.instagramStripLabel = data.label.trim()
    if (data.handle !== undefined) $set.instagramStripHandle = data.handle.trim()
    if (data.url !== undefined) $set.instagramStripUrl = data.url.trim()
    if (data.cta !== undefined) $set.instagramStripCta = data.cta.trim()

    const doc = await StoreSettings.findOneAndUpdate(
      { key: 'default' },
      { $set, $setOnInsert: { key: 'default' } },
      { new: true, upsert: true }
    )

    return NextResponse.json(payload(doc.toJSONSafe()))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || err.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Could not save Instagram feed' }, { status: 500 })
  }
}
