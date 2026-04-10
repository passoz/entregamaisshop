import { http, HttpResponse } from 'msw'

// In-memory "database" for mocks
const db = {
  sellers: [
    {
      id: '1',
      name: 'Depósito do Zé',
      email: 'ze@teste.com',
      category: 'Cervejas e Gelo',
      rating: 5,
      review_count: 0,
      time: '15-25 min',
      min_delivery_fee: 0,
      fee_label: 'A partir de R$ 0,00',
      delivery_areas: [
        { id: '1-area-1', label: 'Cabo Frio', fee: 0, fee_label: 'R$ 0,00' },
        { id: '1-area-2', label: 'Arraial do Cabo', fee: 4.9, fee_label: 'R$ 4,90' },
      ],
      reviews: [],
    },
    {
      id: '2',
      name: 'Conveniência 24h',
      email: 'conv24@teste.com',
      category: 'Bebidas Variadas',
      rating: 4.5,
      review_count: 2,
      time: '20-35 min',
      min_delivery_fee: 3.5,
      fee_label: 'A partir de R$ 3,50',
      delivery_areas: [
        { id: '2-area-1', label: 'Arraial do Cabo', fee: 3.5, fee_label: 'R$ 3,50' },
        { id: '2-area-2', label: 'Sao Pedro da Aldeia', fee: 5, fee_label: 'R$ 5,00' },
      ],
      reviews: [
        { id: '2-review-1', score: 4, customer_id: 'cust-1', customer_name: 'Maria Cliente', created_at: new Date().toISOString() },
        { id: '2-review-2', score: 5, customer_id: 'cust-2', customer_name: 'José Cliente', created_at: new Date().toISOString() },
      ],
    },
    {
      id: '3',
      name: 'Distribuidora Imperial',
      email: 'imperial@teste.com',
      category: 'Vinhos e Destilados',
      rating: 5,
      review_count: 1,
      time: '30-50 min',
      min_delivery_fee: 8.9,
      fee_label: 'A partir de R$ 8,90',
      delivery_areas: [
        { id: '3-area-1', label: 'Rio de Janeiro - Zona Sul', fee: 8.9, fee_label: 'R$ 8,90' },
      ],
      reviews: [
        { id: '3-review-1', score: 5, customer_id: 'cust-3', customer_name: 'Pedro Cliente', created_at: new Date().toISOString() },
      ],
    },
    {
      id: '4',
      name: 'Gelo e Carvão Express',
      email: 'gelo@teste.com',
      category: 'Essenciais',
      rating: 5,
      review_count: 0,
      time: '10-20 min',
      min_delivery_fee: 2.5,
      fee_label: 'A partir de R$ 2,50',
      delivery_areas: [
        { id: '4-area-1', label: 'Sao Pedro da Aldeia', fee: 2.5, fee_label: 'R$ 2,50' },
      ],
      reviews: [],
    }
  ],
  products: [
    // Depósito do Zé
    { id: 'prod-1', seller_id: '1', name: 'Cerveja Pilsen Lata 350ml - Pack 12', price: 34.9, category: 'Cervejas', status: 'active', image: '/assets/beverage-mock.png' },
    { id: 'prod-2', seller_id: '1', name: 'Gelo Cubo 5kg', price: 9.9, category: 'Gelo e Carvão', status: 'active', image: '/assets/ice-mock.png' },
    { id: 'prod-3', seller_id: '1', name: 'Cerveja IPA Garrafa 600ml', price: 12.5, category: 'Cervejas', status: 'active' },
    
    // Conveniência 24h
    { id: 'prod-4', seller_id: '2', name: 'Refrigerante Cola 2L', price: 8.5, category: 'Refrigerantes', status: 'active' },
    { id: 'prod-5', seller_id: '2', name: 'Energético Lata 250ml', price: 7.9, category: 'Energéticos', status: 'active' },
    { id: 'prod-6', seller_id: '2', name: 'Vodka Básica 1L', price: 35.0, category: 'Destilados', status: 'active' },
    { id: 'prod-7', seller_id: '2', name: 'Salgadinho de Batata 100g', price: 14.5, category: 'Petiscos', status: 'active' },

    // Distribuidora Imperial
    { id: 'prod-8', seller_id: '3', name: 'Vinho Tinto Seco Reservado', price: 45.0, category: 'Vinhos', status: 'active' },
    { id: 'prod-9', seller_id: '3', name: 'Whisky 12 Anos 750ml', price: 189.9, category: 'Destilados', status: 'active' },
    { id: 'prod-10', seller_id: '3', name: 'Gin Premium 700ml', price: 110.0, category: 'Destilados', status: 'active' },

    // Gelo e Carvão Express
    { id: 'prod-11', seller_id: '4', name: 'Gelo Moído 10kg', price: 15.0, category: 'Gelo e Carvão', status: 'active' },
    { id: 'prod-12', seller_id: '4', name: 'Carvão Vegetal 3kg', price: 19.9, category: 'Gelo e Carvão', status: 'active' },
  ],
  drivers: [
    { id: 'driver-1', name: 'João Entregador', email: 'joao.entregador@teste.com', status: 'available' },
    { id: 'driver-2', name: 'Carlos Motoboy', email: 'carlos@teste.com', status: 'busy' },
    { id: 'driver-3', name: 'Ana Entrega', email: 'ana@teste.com', status: 'offline' }
  ],
  customers: [
    { id: 'cust-1', name: 'Maria Cliente', email: 'maria@teste.com' },
    { id: 'cust-2', name: 'José Cliente', email: 'jose@teste.com' },
    { id: 'cust-3', name: 'Pedro Cliente', email: 'pedro@teste.com' }
  ],
  orders: [
    { id: 'order-101', customer_id: 'cust-1', seller_id: '1', items: [{ product_id: 'prod-1', quantity: 1 }], total_amount: 34.9, status: 'delivered', driver_id: 'driver-1', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'order-102', customer_id: 'cust-2', seller_id: '3', items: [{ product_id: 'prod-9', quantity: 1 }], total_amount: 189.9, status: 'pending', driver_id: null, created_at: new Date().toISOString() },
    { id: 'order-103', customer_id: 'cust-3', seller_id: '2', items: [{ product_id: 'prod-4', quantity: 2 }, { product_id: 'prod-7', quantity: 1 }], total_amount: 31.5, status: 'accepted', driver_id: 'driver-2', created_at: new Date(Date.now() - 1000000).toISOString() }
  ] as any[],
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
    // Simple mock logic
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
    return HttpResponse.json(db.sellers[0])
  }),

  http.get('*/api/v1/vendedor/delivery-areas', () => {
    return HttpResponse.json(db.sellers[0].delivery_areas)
  }),

  http.put('*/api/v1/vendedor/delivery-areas', async ({ request }) => {
    const payload = await request.json() as any
    const deliveryAreas = (payload.areas || []).map((area: any, index: number) => ({
      id: `seller-area-${index + 1}`,
      label: area.label,
      fee: area.fee,
      fee_label: `R$ ${Number(area.fee || 0).toFixed(2).replace('.', ',')}`,
    }))

    db.sellers[0] = {
      ...db.sellers[0],
      delivery_areas: deliveryAreas,
      min_delivery_fee: deliveryAreas.length ? Math.min(...deliveryAreas.map((area: any) => area.fee)) : 0,
      fee_label: `A partir de R$ ${(deliveryAreas.length ? Math.min(...deliveryAreas.map((area: any) => area.fee)) : 0).toFixed(2).replace('.', ',')}`,
    }

    return HttpResponse.json(db.sellers[0].delivery_areas)
  }),

  http.get('*/api/v1/vendedor/products', () => {
    return HttpResponse.json(db.products.filter(p => p.seller_id === db.sellers[0].id))
  }),

  http.post('*/api/v1/vendedor/products', async ({ request }) => {
    const nextProduct = await request.json() as any
    const newProduct = { ...nextProduct, id: `prod-${Date.now()}`, seller_id: db.sellers[0].id, status: 'active' }
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

  // --- PUBLIC/CUSTOMER MOCKS ---
  http.get('*/api/v1/sellers', () => {
    return HttpResponse.json(db.sellers)
  }),

  // Customer Orders
  http.get('*/api/v1/customers/orders', () => {
    return HttpResponse.json(db.orders.filter(o => o.customer_id === 'cust-1').sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
  }),

  // Store Public Profile
  http.get('*/api/v1/sellers/:id', ({ params }) => {
    const { id } = params
    const seller = db.sellers.find(s => s.id === id)
    if (seller) {
      return HttpResponse.json(seller)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Public Store Products
  http.get('*/api/v1/sellers/:id/products', ({ params }) => {
    const { id } = params
    const storeProducts = db.products.filter(p => p.seller_id === id && p.status === 'active')
    return HttpResponse.json(storeProducts)
  }),

  http.post('*/api/v1/sellers/:id/reviews', async ({ params, request }) => {
    const { id } = params
    const seller = db.sellers.find((item) => item.id === id)
    if (!seller) {
      return new HttpResponse(null, { status: 404 })
    }

    const payload = await request.json() as any
    const nextReview = {
      id: `review-${Date.now()}`,
      score: payload.score,
      comment: payload.comment || '',
      customer_id: 'cust-1',
      customer_name: 'Maria Cliente',
      created_at: new Date().toISOString(),
    }

    const reviews = [nextReview, ...(seller.reviews || [])]
    const average = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
    seller.reviews = reviews
    seller.review_count = reviews.length
    seller.rating = average

    return HttpResponse.json(nextReview, { status: 201 })
  }),

  http.get('*/api/v1/products', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.toLowerCase()
    const category = url.searchParams.get('category')?.toLowerCase()
    
    let filtered = db.products.filter(p => p.status === 'active')
    
    if (query) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query))
    }
    if (category) {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category)
    }

    return HttpResponse.json(filtered)
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
