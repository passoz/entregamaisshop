import { http, HttpResponse } from 'msw'

// In-memory "database" for mocks
const db = {
  sellers: [
    { id: 'seller-1', name: 'Adega Centro', email: 'vendedor@teste.com' }
  ],
  products: [
    { id: 'prod-1', seller_id: 'seller-1', name: 'Cerveja Pilsen 600ml', price: 12.5, status: 'active' },
    { id: 'prod-2', seller_id: 'seller-1', name: 'Vinho Tinto Seco', price: 45.0, status: 'active' }
  ],
  drivers: [
    { id: 'driver-1', name: 'João Entregador', email: 'entregador@teste.com', status: 'available' }
  ],
  customers: [
    { id: 'cust-1', name: 'Maria Cliente', email: 'cliente@teste.com' }
  ],
  orders: [] as any[],
  currentUser: null as any
}

export const handlers = [
  // --- AUTH MOCKS ---
  http.get('*/.well-known/openid-configuration', () => {
    return HttpResponse.json({
      issuer: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081/realms/entregamais',
      authorization_endpoint: 'http://localhost/auth',
      token_endpoint: 'http://localhost/token',
      userinfo_endpoint: 'http://localhost/userinfo',
      jwks_uri: 'http://localhost/certs',
      response_types_supported: ['code', 'token', 'id_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256']
    })
  }),

  http.get('*/protocol/openid-connect/certs', () => {
    return HttpResponse.json({ keys: [] })
  }),

  http.get('*/api/v1/auth/session', () => {
    return HttpResponse.json({ 
      user: db.currentUser || { id: 'guest', name: 'Visitante', email: 'guest@teste.com', roles: [] }
    })
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const { email, role } = await request.json() as any
    // Simple mock logic: any login is successful if it has an email and role
    db.currentUser = { id: `mock-${role}-1`, email, name: `Teste ${role}`, roles: [role] }
    return HttpResponse.json({ 
      user: db.currentUser,
      accessToken: 'mock-token'
    })
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const data = await request.json() as any
    return HttpResponse.json({ 
      user: { id: `mock-new-${data.role}-1`, ...data },
      accessToken: 'mock-token'
    }, { status: 201 })
  }),

  // --- SELLER MOCKS ---
  http.get('*/api/v1/vendedor/profile', () => {
    return HttpResponse.json({ seller_id: 'seller-1', name: 'Adega Centro' })
  }),

  http.get('*/api/v1/vendedor/products', () => {
    return HttpResponse.json(db.products.filter(p => p.seller_id === 'seller-1'))
  }),

  http.post('*/api/v1/vendedor/products', async ({ request }) => {
    const nextProduct = await request.json() as any
    const newProduct = { ...nextProduct, id: `prod-${Date.now()}`, seller_id: 'seller-1', status: 'active' }
    db.products.push(newProduct)
    return HttpResponse.json(newProduct, { status: 201 })
  }),

  http.put('*/api/v1/vendedor/products/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json() as any
    const index = db.products.findIndex(p => p.id === id)
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...updates }
      return HttpResponse.json(db.products[index])
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete('*/api/v1/vendedor/products/:id', ({ params }) => {
    const { id } = params
    db.products = db.products.filter(p => p.id !== id)
    return HttpResponse.json({ success: true })
  }),

  // --- CUSTOMER MOCKS ---
  http.get('*/api/v1/sellers', () => {
    return HttpResponse.json(db.sellers)
  }),

  http.get('*/api/v1/products', () => {
    return HttpResponse.json(db.products)
  }),

  http.post('*/api/v1/orders', async ({ request }) => {
    const payload = await request.json() as any
    const newOrder = {
      id: `order-${Date.now()}`,
      customer_id: 'cust-1',
      seller_id: payload.seller_id,
      items: payload.items,
      total_amount: payload.total_amount,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    db.orders.push(newOrder)
    return HttpResponse.json(newOrder, { status: 201 })
  }),

  // --- DRIVER MOCKS ---
  http.get('*/api/v1/entregador/profile', () => {
    return HttpResponse.json(db.drivers[0])
  }),

  http.get('*/api/v1/entregador/orders', () => {
    return HttpResponse.json(db.orders.filter(o => o.status === 'pending' || o.driver_id === 'driver-1'))
  }),

  http.post('*/api/v1/entregador/orders/:id/accept', ({ params }) => {
    const { id } = params
    const order = db.orders.find(o => o.id === id)
    if (order) {
      order.status = 'accepted'
      order.driver_id = 'driver-1'
      return HttpResponse.json(order)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post('*/api/v1/entregador/orders/:id/deliver', ({ params }) => {
    const { id } = params
    const order = db.orders.find(o => o.id === id)
    if (order) {
      order.status = 'delivered'
      return HttpResponse.json(order)
    }
    return new HttpResponse(null, { status: 404 })
  })
]
