'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Save, Check, X } from 'lucide-react'

interface ConfigItem {
  key: string
  value: string
  description: string
  isSecret: boolean
}

export default function AdminConfigPage() {
  const { data: session, status } = useSession()
  const [configs, setConfigs] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const defaultConfigs = [
    {
      key: 'openai_api_key',
      value: '',
      description: 'OpenAI API Key for GPT models and embeddings',
      isSecret: true
    },
    {
      key: 'gemini_api_key', 
      value: '',
      description: 'Google Gemini API Key for Gemini models',
      isSecret: true
    },
    {
      key: 'default_ai_model',
      value: 'gpt-3.5-turbo',
      description: 'Default AI model to use for chat responses',
      isSecret: false
    },
    {
      key: 'max_document_size_mb',
      value: '10',
      description: 'Maximum document upload size in MB',
      isSecret: false
    }
  ]

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/config')
      if (response.ok) {
        const data = await response.json()
        setConfigs(data.configs || [])
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (key: string, value: string) => {
    setSaving(key)
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })

      if (response.ok) {
        await fetchConfigs()
      }
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setSaving(null)
    }
  }

  const updateConfigValue = (key: string, value: string) => {
    setConfigs(prev => prev.map(config => 
      config.key === key ? { ...config, value } : config
    ))
  }

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key)
    return config?.value || defaultConfigs.find(d => d.key === key)?.value || ''
  }

  const allConfigs = defaultConfigs.map(defaultConfig => {
    const existingConfig = configs.find(c => c.key === defaultConfig.key)
    return existingConfig || defaultConfig
  })

  // Redirect if not admin
  if (status === 'loading') return <div>Loading...</div>
  if (!session?.user?.role || (session.user as any).role !== 'admin') {
    redirect('/dashboard')
  }

  if (loading) {
    return <div className="p-8">Loading configuration...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage API keys and system settings for your AI platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>
            Configure API keys and settings for AI models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allConfigs.map((config) => (
            <div key={config.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={config.key} className="text-sm font-medium">
                  {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                {config.isSecret && (
                  <Badge variant="secondary" className="text-xs">
                    Secret
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {config.description}
              </p>

              <div className="flex items-center gap-2">
                {config.isSecret ? (
                  <div className="relative flex-1">
                    <Input
                      id={config.key}
                      type={showSecrets[config.key] ? 'text' : 'password'}
                      value={getConfigValue(config.key)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfigValue(config.key, e.target.value)}
                      placeholder={config.isSecret ? '••••••••••••••••' : config.description}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowSecret(config.key)}
                    >
                      {showSecrets[config.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Input
                    id={config.key}
                    value={getConfigValue(config.key)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfigValue(config.key, e.target.value)}
                    placeholder={config.description}
                    className="flex-1"
                  />
                )}
                
                <Button
                  onClick={() => saveConfig(config.key, getConfigValue(config.key))}
                  disabled={saving === config.key}
                  size="sm"
                >
                  {saving === config.key ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
          <CardDescription>
            Current status of your AI model configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">OpenAI</p>
                <p className="text-sm text-muted-foreground">GPT models & embeddings</p>
              </div>
              {getConfigValue('openai_api_key') ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <X className="h-3 w-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Google Gemini</p>
                <p className="text-sm text-muted-foreground">Gemini models</p>
              </div>
              {getConfigValue('gemini_api_key') ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <X className="h-3 w-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}