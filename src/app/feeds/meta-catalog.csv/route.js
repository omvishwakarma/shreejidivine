import { dbConnect } from '@/lib/mongo/db'
import { Product } from '@/lib/mongo/Product'
import { catalogCsv, catalogOrigin } from '@/lib/metaCatalog'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await dbConnect()
    const products = await Product.find({ active: true }).sort({ createdAt: 1 }).lean()
    const body = catalogCsv(
      products.map((product) => ({
        ...product,
        id: String(product._id),
      })),
      catalogOrigin(request)
    )
    return new Response(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=1800',
      },
    })
  } catch (err) {
    console.error(err)
    return new Response('id,title\n', {
      status: 500,
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    })
  }
}
