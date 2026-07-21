import Footer from '@/components/footer'
import MdNav from '@/components/md-nav'
import { getProductBySlug, getProducts } from '@/app/actions/store'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetail from '@/components/store/product-detail'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Not Found — Moto D' }
  return {
    title: `${product.name} — Moto D`,
    description: product.description ?? 'Official Moto D gear.',
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const all = await getProducts()
  const related = all.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4)

  return (
    <>
      <MdNav />
      <main className="pt-16">
        <ProductDetail product={product} related={related} />
      </main>
      <Footer />
    </>
  )
}
