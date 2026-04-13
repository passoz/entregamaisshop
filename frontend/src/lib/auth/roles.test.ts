import { describe, it, expect } from 'vitest'
import {
  normalizeRole,
  normalizeRoles,
  getRequiredRoleForPortal,
  userCanAccessPortal,
  getHomePathForRole
} from './roles'

describe('Role Management Library', () => {
  describe('normalizeRole', () => {
    it('should correctly normalize role names regardless of case', () => {
      expect(normalizeRole('ADMIN')).toBe('admin')
      expect(normalizeRole('vendedor')).toBe('seller')
      expect(normalizeRole('entregador')).toBe('driver')
      expect(normalizeRole('Customer')).toBe('customer')
    })

    it('should handle aliases correctly', () => {
      expect(normalizeRole('vendedor')).toBe('seller')
      expect(normalizeRole('seller')).toBe('seller')
    })

    it('should return null for invalid roles', () => {
      expect(normalizeRole('invalid')).toBeNull()
      expect(normalizeRole('')).toBeNull()
      expect(normalizeRole(null as any)).toBeNull()
    })
  })

  describe('normalizeRoles', () => {
    it('should normalize and deduplicate a list of roles', () => {
      const input = ['ADMIN', 'vendedor', 'admin', 'unknown']
      const result = normalizeRoles(input)
      expect(result).toHaveLength(2)
      expect(result).toContain('admin')
      expect(result).toContain('seller')
    })

    it('should return an empty array for invalid input', () => {
      expect(normalizeRoles([])).toEqual([])
      expect(normalizeRoles(['unknown'])).toEqual([])
    })
  })

  describe('getRequiredRoleForPortal', () => {
    it('should return the correct canonical role for each portal', () => {
      expect(getRequiredRoleForPortal('admin')).toBe('admin')
      expect(getRequiredRoleForPortal('vendedor')).toBe('seller')
      expect(getRequiredRoleForPortal('customer')).toBe('customer')
      expect(getRequiredRoleForPortal('entregador')).toBe('driver')
    })

    it('should fallback to role normalization if portal not explicitly mapped', () => {
      expect(getRequiredRoleForPortal('admin')).toBe('admin')
    })
  })

  describe('userCanAccessPortal', () => {
    it('should allow access if user has the correct role', () => {
      expect(userCanAccessPortal(['admin'], 'admin')).toBe(true)
      expect(userCanAccessPortal(['vendedor'], 'vendedor')).toBe(true)
      expect(userCanAccessPortal(['customer'], 'customer')).toBe(true)
    })

    it('should allow access even with non-canonical user roles', () => {
      expect(userCanAccessPortal(['vendedor'], 'vendedor')).toBe(true)
    })

    it('should deny access if user lacks the required role', () => {
      expect(userCanAccessPortal(['customer'], 'admin')).toBe(false)
      expect(userCanAccessPortal(['driver'], 'vendedor')).toBe(false)
    })

    it('should deny access for admins on common portals', () => {
      // In our implementation, admin is its own role and doesn't implicitly include 'customer'
      expect(userCanAccessPortal(['admin'], 'customer')).toBe(false)
    })
  })

  describe('getHomePathForRole', () => {
    it('should return the correct redirect path for each canonical role', () => {
      expect(getHomePathForRole('admin')).toBe('/admin')
      expect(getHomePathForRole('seller')).toBe('/vendedor/dashboard')
      expect(getHomePathForRole('driver')).toBe('/entregador/dashboard')
      expect(getHomePathForRole('customer')).toBe('/')
    })
  })
})
