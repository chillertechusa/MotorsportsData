import { redirect } from 'next/navigation'
import { getMdOwner } from '@/lib/md-owner-auth'
import { getShopStats, getShopOrders, getShopProducts } from '@/app/actions/md-shop-owner'
import ShopManagementClient from './shop-management-client'

export const metadata = {
  title: 'Shop Management — Owner Console',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ShopManagementPage() {
  const owner = await getMdOwner()
  if (!owner) redirect('/data/sign-in')

  const [stats, orders, products] = await Promise.all([
    getShopStats(),
    getShopOrders(),
    getShopProducts(),
  ])

  return (
    <ShopManagementClient
      stats={stats}
      orders={orders}
      products={products}
    />
  )
}
