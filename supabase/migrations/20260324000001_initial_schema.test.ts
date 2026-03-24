import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

describe('Initial Schema Migration', () => {
  it('should exist', async () => {
    const migrationPath = path.join(
      __dirname,
      '20260324000001_initial_schema.sql'
    )

    const exists = await fs.access(migrationPath)
      .then(() => true)
      .catch(() => false)

    expect(exists).toBe(true)
  })

  it('should contain all required tables', async () => {
    const migrationPath = path.join(
      __dirname,
      '20260324000001_initial_schema.sql'
    )

    const content = await fs.readFile(migrationPath, 'utf-8')

    expect(content).toContain('CREATE TABLE users')
    expect(content).toContain('CREATE TABLE visit_days')
    expect(content).toContain('CREATE TABLE products')
    expect(content).toContain('CREATE TABLE visits')
    expect(content).toContain('CREATE TABLE visit_products')
  })

  it('should contain indexes', async () => {
    const migrationPath = path.join(
      __dirname,
      '20260324000001_initial_schema.sql'
    )

    const content = await fs.readFile(migrationPath, 'utf-8')

    expect(content).toContain('CREATE INDEX idx_visits_visit_day')
    expect(content).toContain('CREATE INDEX idx_visits_created_by')
    expect(content).toContain('CREATE INDEX idx_visit_products_visit')
    expect(content).toContain('CREATE INDEX idx_visit_products_product')
    expect(content).toContain('CREATE INDEX idx_visit_days_date')
  })
})
