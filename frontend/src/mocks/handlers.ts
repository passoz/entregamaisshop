import { getRequiredRoleForPortal, normalizeRoles } from '@/lib/auth/roles'
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
    { id: 'order-101', customer_id: 'cust-1', seller_id: '1', items: [{ product_id: 'prod-1', quantity: 1 }], total_amount: 34.9, status: 'delivered', driver_id: 'driver-1', created_at: new Date(Date.now() - 86400000).toISOString(), delivery_address_json: JSON.stringify({ raw: "Rua Teste, 123" }) },
    { id: 'order-102', customer_id: 'cust-2', seller_id: '3', items: [{ product_id: 'prod-9', quantity: 1 }], total_amount: 189.9, status: 'pending', driver_id: null, created_at: new Date().toISOString(), delivery_address_json: JSON.stringify({ raw: "Av Central, 456" }) },
    { id: 'order-103', customer_id: 'cust-3', seller_id: '2', items: [{ product_id: 'prod-4', quantity: 2 }, { product_id: 'prod-7', quantity: 1 }], total_amount: 31.5, status: 'accepted', driver_id: 'driver-2', created_at: new Date(Date.now() - 1000000).toISOString(), delivery_address_json: JSON.stringify({ raw: "Praça da Matriz, 789" }) }
  ] as any[],
  pendingSellers: [] as any[],
  pendingDrivers: [] as any[],
  currentUser: null as any,
  authUsers: {
    'admin@entregamaisshop.com': { id: 'admin-1', name: 'Administrador', roles: ['admin'] },
    'cliente@cliente.com': { id: 'customer-1', name: 'Cliente Demo', roles: ['customer'] },
    'cliente@teste.com': { id: 'customer-2', name: 'Cliente Teste', roles: ['customer'] },
    'vendedor@vendedor.com': { id: 'seller-1', name: 'Vendedor Demo', roles: ['seller'] },
    'vendedor@teste.com': { id: 'seller-2', name: 'Vendedor Teste', roles: ['seller'] },
    'entregador@entregador.com': { id: 'driver-1', name: 'Entregador Demo', roles: ['driver'] },
    'entregador@teste.com': { id: 'driver-2', name: 'Entregador Teste', roles: ['driver'] },
  } as Record<string, { id: string; name: string; roles: string[] }>
}

export const handlers = [
  // Log all requests for debugging
  /* http.all('*', ({ request }) => {
    console.log(`[MSW ALL] ${request.method} ${request.url}`);
    return undefined // Continue handling
  }), */

  // --- AUTH MOCKS ---
  http.get('*/.well-known/openid-configuration', () => {
    console.log('[MSW] GET /.well-known/openid-configuration');
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
    console.log('[MSW] GET /protocol/openid-connect/certs');
    return HttpResponse.json({ keys: [] })
  }),

  http.get('*/api/auth/session', () => {
    console.log('[MSW] GET /api/auth/session', { currentUser: db.currentUser?.email });
    return HttpResponse.json({ 
      session: db.currentUser ? { user: db.currentUser, accessToken: 'mock-token' } : null
    })
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    try {
      const { email, role } = await request.json() as any
      const requestedRole = getRequiredRoleForPortal(role)
      const cleanEmail = String(email).trim().toLowerCase()
      console.log('[MSW] POST /api/auth/login', { cleanEmail, role, requestedRole });

      const existingUser = db.authUsers[cleanEmail]

      if (!existingUser || !requestedRole || !normalizeRoles(existingUser.roles).includes(requestedRole)) {
        console.warn('[MSW] Login failed: User not found or role mismatch', { existingUser, requestedRole });
        return HttpResponse.json({ message: 'Credenciais invalidas' }, { status: 401 })
      }

      db.currentUser = { ...existingUser, email: cleanEmail, roles: normalizeRoles(existingUser.roles) }
      console.log('[MSW] Login success', { currentUser: db.currentUser });
      return HttpResponse.json({ 
        session: {
          user: db.currentUser,
          accessToken: 'mock-token'
        }
      })
    } catch (e) {
      console.error('[MSW] Error in /api/auth/login:', e);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  http.post('*/api/auth/logout', () => {
    console.log('[MSW] POST /api/auth/logout');
    db.currentUser = null
    return HttpResponse.json({ success: true })
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    try {
      const data = await request.json() as any
      const email = String(data.email || '').trim().toLowerCase()
      const requestedRole = getRequiredRoleForPortal(data.role)
      console.log('[MSW] POST /api/auth/register', { email, requestedRole, roleInBody: data.role });

      const existingUser = db.authUsers[email]
      const nextRoles = normalizeRoles([...(existingUser?.roles || []), requestedRole || 'customer'])

      const user = {
        id: existingUser?.id || `mock-new-${nextRoles[0]}-${Date.now()}`,
        name: data.name || existingUser?.name || email,
        roles: nextRoles,
      }

      db.authUsers[email] = user
      console.log('[MSW] User registered/updated in db', user);

      // Handle partnership registration
      if (requestedRole === 'seller') {
        db.pendingSellers.push({
          id: user.id,
          name: data.storeName || user.name,
          document: data.cnpj || '00.000.000/0001-00',
          status: 'pending',
          created_at: new Date().toISOString()
        })
        console.log('[MSW] Added to pending sellers');
      } else if (requestedRole === 'driver') {
        db.pendingDrivers.push({
          id: user.id,
          status: 'pending',
          vehicle_type: data.vehicleType || 'Moto',
          created_at: new Date().toISOString(),
          edges: { user: { name: user.name, email } }
        })
        console.log('[MSW] Added to pending drivers');
      }

      return HttpResponse.json({ 
        user: { id: db.authUsers[email].id, ...data, roles: db.authUsers[email].roles },
        roleAdded: requestedRole
      }, { status: 201 })
    } catch (e) {
      console.error('[MSW] Error in /api/auth/register:', e);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // --- ADMIN MOCKS ---
  http.get('*/api/v1/cart', () => {
    console.log('[MSW] GET /api/v1/cart');
    return HttpResponse.json({ items: [], total: 0 })
  }),

  http.get('*/api/v1/admin/sellers', () => {
    return HttpResponse.json(db.pendingSellers)
  }),

  http.get('*/api/v1/admin/drivers', () => {
    return HttpResponse.json(db.pendingDrivers)
  }),

  http.post('*/api/v1/admin/sellers/:id/approve', ({ params }) => {
    const { id } = params
    const seller = db.pendingSellers.find(s => s.id === id)
    if (seller) {
      seller.status = 'approved'
      db.sellers.push({
        id: seller.id,
        name: seller.name,
        email: 'mock@seller.com',
        category: 'Novas Bebidas',
        rating: 5,
        review_count: 0,
        time: '15-30 min',
        min_delivery_fee: 5.0,
        fee_label: 'R$ 5,00',
        delivery_areas: [],
        reviews: []
      })
      db.pendingSellers = db.pendingSellers.filter(s => s.id !== id)
      return HttpResponse.json({ success: true })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post('*/api/v1/admin/drivers/:id/approve', ({ params }) => {
    const { id } = params
    const driver = db.pendingDrivers.find(d => d.id === id)
    if (driver) {
      driver.status = 'approved'
      db.drivers.push({
        id: driver.id,
        name: driver.edges?.user?.name || 'Novo Entregador',
        email: driver.edges?.user?.email || 'mock@driver.com',
        status: 'available'
      })
      db.pendingDrivers = db.pendingDrivers.filter(d => d.id !== id)
      return HttpResponse.json({ success: true })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // --- SELLER MOCKS ---
  http.get('*/api/v1/vendedor/profile', () => {
    return HttpResponse.json(db.sellers[0])
  }),

  http.get('*/api/v1/vendedor/orders', () => {
    // Return all orders for the current seller if authenticated
    const sellerId = db.currentUser?.id || 'seller-1'
    const sellerOrders = db.orders.filter(o => o.seller_id === sellerId || (o.seller_id === '1' && sellerId === 'seller-1'))
    return HttpResponse.json(sellerOrders)
  }),

  http.post('*/api/v1/vendedor/orders/:id/confirm', ({ params }) => {
    const { id } = params
    const order = db.orders.find(o => o.id === id)
    if (order) {
      order.status = 'confirmed' // Map confirmed to "Em Preparo"
      return HttpResponse.json(order)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post('*/api/v1/vendedor/orders/:id/ready', ({ params }) => {
    const { id } = params
    const order = db.orders.find(o => o.id === id)
    if (order) {
      order.status = 'ready' // Map ready to "Pronto para Entrega"
      return HttpResponse.json(order)
    }
    return new HttpResponse(null, { status: 404 })
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
    const sellerId = db.currentUser?.id || '1'
    return HttpResponse.json(db.products.filter(p => p.seller_id === sellerId || (p.seller_id === '1' && sellerId === 'seller-1')))
  }),

  http.post('*/api/v1/vendedor/products', async ({ request }) => {
    const nextProduct = await request.json() as any
    const sellerId = db.currentUser?.id || '1'
    const newProduct = { ...nextProduct, id: `prod-${Date.now()}`, seller_id: sellerId, status: 'active' }
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
    const customerId = db.currentUser?.id || 'cust-1'
    return HttpResponse.json(db.orders.filter(o => o.customer_id === customerId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
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
    const customerId = db.currentUser?.id || 'cust-1'
    const newOrder = {
      id: `order-${Date.now()}`,
      customer_id: customerId,
      seller_id: payload.seller_id,
      items: payload.items,
      total_amount: payload.total_amount,
      status: 'created', // Start as created
      created_at: new Date().toISOString(),
      delivery_address_json: JSON.stringify({ raw: payload.delivery_address || "Endereço Teste" }),
      edges: {
        items: payload.items.map((it: any) => ({
          ...it,
          product: db.products.find(p => p.id === it.product_id),
          unit_price: it.price
        }))
      }
    }
    db.orders.push(newOrder)
    return HttpResponse.json(newOrder, { status: 201 })
  }),

  // --- DRIVER MOCKS ---
  http.get('*/api/v1/entregador/profile', () => {
    return HttpResponse.json(db.drivers[0])
  }),

  http.get('*/api/v1/entregador/orders', () => {
    const driverId = db.currentUser?.id || 'driver-1'
    return HttpResponse.json(db.orders.filter(o => o.status === 'ready' || o.driver_id === driverId))
  }),

  http.post('*/api/v1/entregador/orders/:id/accept', ({ params }) => {
    const { id } = params
    const order = db.orders.find(o => o.id === id)
    const driverId = db.currentUser?.id || 'driver-1'
    if (order) {
      order.status = 'accepted'
      order.driver_id = driverId
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
