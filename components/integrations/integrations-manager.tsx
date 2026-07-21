'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

interface ApiKey {
  id: string
  keyName: string
  keyPrefix: string
  scope: string
  rateLimit: number
  lastUsedAt: string | null
  expiresAt: string | null
  active: boolean
  createdAt: string
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  active: boolean
  createdAt: string
}

export function IntegrationsManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [keysRes, webhooksRes] = await Promise.all([
          fetch('/api/v1/api-keys'),
          fetch('/api/v1/webhooks'),
        ])

        if (keysRes.ok) {
          const data = await keysRes.json()
          setApiKeys(data.keys || [])
        }

        if (webhooksRes.ok) {
          const data = await webhooksRes.json()
          setWebhooks(data.webhooks || [])
        }
      } catch (error) {
        console.error('[Integrations] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateKey = async () => {
    if (!newKeyName) return

    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (res.ok) {
        const data = await res.json()
        setApiKeys([...apiKeys, data.key])
        setNewKeyName('')
        setShowNewKeyForm(false)

        // Show the full key briefly
        setCopiedKey(data.fullKey)
        setTimeout(() => setCopiedKey(null), 3000)
      }
    } catch (error) {
      console.error('[Integrations] Error creating key:', error)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/v1/api-keys/${keyId}`, { method: 'DELETE' })
      if (res.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId))
      }
    } catch (error) {
      console.error('[Integrations] Error deleting key:', error)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newSet = new Set(visibleKeys)
    if (newSet.has(keyId)) {
      newSet.delete(keyId)
    } else {
      newSet.add(keyId)
    }
    setVisibleKeys(newSet)
  }

  return (
    <Tabs defaultValue="keys" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="keys">API Keys ({apiKeys.length})</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="keys" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Use API keys to authenticate requests to the MD API
          </p>
          <Button onClick={() => setShowNewKeyForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Key
          </Button>
        </div>

        {showNewKeyForm && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., RaceBox Integration"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateKey} size="sm">
                  Create
                </Button>
                <Button onClick={() => setShowNewKeyForm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id} className="bg-slate-900/30 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{key.keyName}</span>
                      <Badge variant={key.active ? 'default' : 'secondary'}>
                        {key.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-slate-800/50 px-2 py-1 rounded font-mono">
                        {visibleKeys.has(key.id) ? key.keyPrefix + '***...' : key.keyPrefix + '****'}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="hover:text-foreground"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Scope: {key.scope}</p>
                      <p>Rate Limit: {key.rateLimit} req/min</p>
                      {key.lastUsedAt && <p>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteKey(key.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {apiKeys.length === 0 && !showNewKeyForm && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No API keys yet. Create one to get started.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="webhooks" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Webhooks deliver real-time events to your application
          </p>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Webhook
          </Button>
        </div>

        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="bg-slate-900/30 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{webhook.name}</span>
                      <Badge variant={webhook.active ? 'default' : 'secondary'}>
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{webhook.url}</p>
                    <div className="flex gap-1 flex-wrap">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {webhooks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No webhooks configured yet.
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
