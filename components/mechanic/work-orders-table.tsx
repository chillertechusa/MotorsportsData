'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface WorkOrder {
  id: string
  title: string
  status: string
  priority: string
  estimatedHours?: number
  actualHours?: number
  createdAt: string
}

export function WorkOrdersTable() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/work-orders')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        setOrders(data.workOrders || [])
      } catch (error) {
        console.error('[v0] Error fetching work orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'in-progress':
        return 'bg-primary/20 border-primary/50 text-primary'
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'on-hold':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      default:
        return 'bg-zinc-500/20 border-zinc-500/50 text-zinc-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400'
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'low':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      default:
        return 'bg-zinc-500/20 border-zinc-500/50 text-zinc-400'
    }
  }

  if (isLoading) {
    return <div className="p-4 text-zinc-400">Loading work orders...</div>
  }

  if (orders.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="pt-6">
          <p className="text-center text-zinc-400">No work orders yet. Create your first order!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800">
      <CardHeader>
        <CardTitle className="text-primary">Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-primary">Title</TableHead>
              <TableHead className="text-primary">Status</TableHead>
              <TableHead className="text-primary">Priority</TableHead>
              <TableHead className="text-primary">Hours</TableHead>
              <TableHead className="text-primary">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.id} className="border-zinc-800">
                <TableCell className="font-medium">{order.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border ${getPriorityColor(order.priority)}`}>
                    {order.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400">
                  {order.actualHours ? `${order.actualHours}h` : order.estimatedHours ? `~${order.estimatedHours}h` : '-'}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
