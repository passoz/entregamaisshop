import { describe, it, expect } from 'vitest'
import { getMockUser, upsertMockUser } from './mock-users'

describe('Mock Users Library', () => {
  describe('getMockUser', () => {
    it('should retrieve an existing mock user by email (case-insensitive)', () => {
      const user = getMockUser('admin@entregamaisshop.com')
      expect(user).not.toBeNull()
      expect(user?.name).toBe('Administrador')
      expect(user?.roles).toContain('admin')
      
      const userCase = getMockUser('ADMIN@ENTREGAMAISSHOP.COM')
      expect(userCase).toEqual(user)
    })

    it('should return null for non-existent users', () => {
      expect(getMockUser('nonexistent@example.com')).toBeNull()
    })
  })

  describe('upsertMockUser', () => {
    it('should create a new mock user if it does not exist', () => {
      const email = 'newuser@teste.com'
      const name = 'New User'
      const role = 'customer'
      
      const user = upsertMockUser(email, name, role)
      expect(user.name).toBe(name)
      expect(user.roles).toContain('customer')
      
      expect(getMockUser(email)).toEqual(user)
    })

    it('should update roles of an existing mock user', () => {
      const email = 'vendedor@vendedor.com'
      const user = upsertMockUser(email, undefined, 'admin')
      
      expect(user.roles).toContain('seller')
      expect(user.roles).toContain('admin')
    })
  })
})
