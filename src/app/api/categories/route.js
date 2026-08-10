import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongo/auth'
import { getCategoryTree } from '@/lib/categories'

export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const nav = searchParams.get('nav') === '1'
    const home = searchParams.get('home') === '1'
    const tree = await getCategoryTree({
      navOnly: nav,
      homeOnly: home,
      activeOnly: true,
    })
    return NextResponse.json({ categories: tree })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not load categories', categories: [] }, { status: 500 })
  }
}
