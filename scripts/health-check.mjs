#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config()

const BASE_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3000'
const TIMEOUT = 5000

const ENDPOINTS = [
  { name: 'Auth', path: '/api/health/auth' },
  { name: 'Database', path: '/api/health/database' },
  { name: 'Square', path: '/api/health/square' },
  { name: 'Feature Gates', path: '/api/health/feature-gates' },
  { name: 'Cron Jobs', path: '/api/health/cron' },
]

async function checkHealth() {
  console.log(`[Health Check] Starting system health checks...`)
  console.log(`[Health Check] Base URL: ${BASE_URL}\n`)

  const results = []
  let allHealthy = true

  for (const endpoint of ENDPOINTS) {
    try {
      const url = `${BASE_URL}${endpoint.path}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })
      clearTimeout(timeoutId)

      const data = await response.json()
      const healthy = response.ok && data.status === 'ok'

      results.push({
        service: endpoint.name,
        status: healthy ? '✓ OK' : '✗ ERROR',
        statusCode: response.status,
        timestamp: data.timestamp,
      })

      if (!healthy) allHealthy = false

      console.log(`[${endpoint.name}] ${healthy ? '✓' : '✗'} ${response.status}`)
    } catch (error) {
      allHealthy = false
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.log(`[${endpoint.name}] ✗ ${errorMsg}`)
      results.push({
        service: endpoint.name,
        status: '✗ ERROR',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      })
    }
  }

  console.log(`\n[Health Check] ${allHealthy ? '✓ All systems healthy' : '✗ Some systems unhealthy'}`)
  console.log(`[Health Check] Completed at ${new Date().toISOString()}\n`)

  // Exit with code 0 if all healthy, 1 if any unhealthy
  process.exit(allHealthy ? 0 : 1)
}

checkHealth()
