'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkOrderFormProps {
  onSubmit?: (data: any) => void
}

export function WorkOrderForm({ onSubmit }: WorkOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    estimatedHours: '',
    actualHours: '',
    partsUsed: [] as string[],
    notes: '',
  })

  const [currentPart, setCurrentPart] = useState('')

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addPart = () => {
    if (currentPart.trim()) {
      setFormData(prev => ({
        ...prev,
        partsUsed: [...prev.partsUsed, currentPart],
      }))
      setCurrentPart('')
    }
  }

  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create work order')
      
      const data = await response.json()
      onSubmit?.(data)
      
      setFormData({
        vehicleId: '',
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        estimatedHours: '',
        actualHours: '',
        partsUsed: [],
        notes: '',
      })
    } catch (error) {
      console.error('[v0] Work order error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <Label htmlFor="title">Work Order Title</Label>
          <Input
            id="title"
            placeholder="e.g., Carburetor Cleaning & Jetting"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="border-zinc-800 bg-zinc-900"
            required
          />
        </div>

        {/* Priority */}
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
            <SelectTrigger id="priority" className="border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger id="status" className="border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Hours */}
        <div>
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            step="0.5"
            placeholder="2.5"
            value={formData.estimatedHours}
            onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Actual Hours */}
        <div>
          <Label htmlFor="actualHours">Actual Hours</Label>
          <Input
            id="actualHours"
            type="number"
            step="0.5"
            placeholder="2.0"
            value={formData.actualHours}
            onChange={(e) => handleChange('actualHours', parseFloat(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Work Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the work to be done, observations, and any before/after notes..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="border-zinc-800 bg-zinc-900 min-h-[100px]"
        />
      </div>

      {/* Parts Used */}
      <div>
        <Label>Parts Used</Label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Part name or part number"
            value={currentPart}
            onChange={(e) => setCurrentPart(e.target.value)}
            className="border-zinc-800 bg-zinc-900"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPart}
            className="border-zinc-800 text-primary hover:text-primary hover:bg-primary/10"
          >
            Add
          </Button>
        </div>

        {formData.partsUsed.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.partsUsed.map((part, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="border-primary/50 text-primary cursor-pointer hover:bg-primary/20"
                onClick={() => removePart(idx)}
              >
                {part} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Mechanic Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes for the team..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="border-zinc-800 bg-zinc-900 min-h-[80px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !formData.title}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? 'Creating Work Order...' : 'Create Work Order'}
      </Button>
    </form>
  )
}
