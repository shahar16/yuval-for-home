import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

describe('Initial Schema Migration', () => {
  it('should exist', async () => {
    const migrationPath = path.join(
      __dirname,
      '001_initial_schema.sql'
    )

    const exists = await fs.access(migrationPath)
      .then(() => true)
      .catch(() => false)

    expect(exists).toBe(true)
  })

  it('should contain all required tables', async () => {
    const migrationPath = path.join(
      __dirname,
      '001_initial_schema.sql'
    )

    const content = await fs.readFile(migrationPath, 'utf-8')

    expect(content).toContain('CREATE TABLE users')
    expect(content).toContain('CREATE TABLE visit_days')
    expect(content).toContain('CREATE TABLE products')
    expect(content).toContain('CREATE TABLE visits')
    expect(content).toContain('CREATE TABLE visit_products')
  })

  it('should contain correct indexes per spec', async () => {
    const migrationPath = path.join(
      __dirname,
      '001_initial_schema.sql'
    )

    const content = await fs.readFile(migrationPath, 'utf-8')

    // Required indexes per spec
    expect(content).toContain('CREATE INDEX idx_visits_visit_day')
    expect(content).toContain('CREATE INDEX idx_visits_created_at')
    expect(content).toContain('CREATE INDEX idx_visit_days_date')
    expect(content).toContain('CREATE INDEX idx_visit_products_visit')

    // Should NOT contain these indexes (not in spec)
    expect(content).not.toContain('CREATE INDEX idx_visits_created_by')
    expect(content).not.toContain('CREATE INDEX idx_visit_products_product')
  })

  it('should contain seed data', async () => {
    const migrationPath = path.join(
      __dirname,
      '001_initial_schema.sql'
    )

    const content = await fs.readFile(migrationPath, 'utf-8')

    // Check for seed users
    expect(content).toContain('INSERT INTO users')
    expect(content).toContain('יובל')
    expect(content).toContain('שרה')
    expect(content).toContain('דוד')

    // Check for seed products
    expect(content).toContain('INSERT INTO products')
    expect(content).toContain('סל מתנה א')
    expect(content).toContain('פרחים')
    expect(content).toContain('יין')
    expect(content).toContain('שוקולד')
  })
})
