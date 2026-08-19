// Consolidated mock server using built-in http (no external deps)
const http = require('http')
const url = require('url')

const PORT = process.env.PORT || 5000

// In-memory data stores
const animals = [
  { id: 'a1', name: 'Daisy', type: 'Cow', price: 120000, description: 'Healthy dairy cow', location: 'Nakuru', images: [] },
  { id: 'a2', name: 'Babe', type: 'Pig', price: 30000, description: 'Young pig', location: 'Kiambu', images: [] },
]

let orders = []
let payments = {}
let nextOrderId = 1000

function json(res, status, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  })
  res.end(body)
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  const { pathname, query } = parsed

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    })
    return res.end()
  }

  // GET /api/animals
  if (req.method === 'GET' && pathname === '/api/animals') {
    return json(res, 200, { animals })
  }

  // GET /api/animals/:id
  if (req.method === 'GET' && pathname.startsWith('/api/animals/')) {
    const id = pathname.split('/').pop()
    const a = animals.find((x) => x.id === id)
    if (!a) return json(res, 404, { message: 'Not found' })
    return json(res, 200, a)
  }

  // POST /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseBody(req)
    const username = body.username || body.email || 'guest'
    const user = {
      id: 'u_' + Math.random().toString(36).slice(2, 8),
      username,
      role: username.startsWith('farmer') ? 'farmer' : 'customer',
      phone: body.phone || '0712345678',
      location: body.location || '',
    }
    return json(res, 200, { token: 'mock-token-' + user.id, user })
  }

  // GET /api/cart
  if (req.method === 'GET' && pathname === '/api/cart') {
    // return one cart item referencing the first animal for testing
    return json(res, 200, { cart_items: [ { id: 'ci1', animal: animals[0] } ] })
  }

  // POST /api/orders (create order)
  if (req.method === 'POST' && pathname === '/api/orders') {
    const body = await parseBody(req)
    const order = {
      id: String(nextOrderId++),
      items: body.items || [],
      delivery_address: body.delivery_address || 'Unknown',
      delivery_phone: body.delivery_phone || '0',
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    orders.push(order)
    payments[order.id] = { status: 'pending', attempts: 0 }
    return json(res, 201, order)
  }

  // GET /api/orders/my-orders
  if (req.method === 'GET' && pathname === '/api/orders/my-orders') {
    return json(res, 200, orders)
  }

  // POST /api/orders/:id/confirm and /reject (farmer actions)
  if (req.method === 'POST' && pathname.startsWith('/api/orders/') && pathname.endsWith('/confirm')) {
    const id = pathname.split('/')[3]
    const o = orders.find((x) => x.id === id)
    if (!o) return json(res, 404, { message: 'Order not found' })
    o.status = 'confirmed'
    return json(res, 200, o)
  }
  if (req.method === 'POST' && pathname.startsWith('/api/orders/') && pathname.endsWith('/reject')) {
    const id = pathname.split('/')[3]
    const o = orders.find((x) => x.id === id)
    if (!o) return json(res, 404, { message: 'Order not found' })
    o.status = 'rejected'
    return json(res, 200, o)
  }

  // POST /api/payments/initiate
  if (req.method === 'POST' && pathname === '/api/payments/initiate') {
    const body = await parseBody(req)
    const orderId = body.order_id
    if (!orderId || !payments[orderId]) return json(res, 400, { message: 'order_id not found' })
    payments[orderId].status = 'stk_sent'
    payments[orderId].attempts = 0
    return json(res, 200, { status: 'stk_sent' })
  }

  // GET /api/payments/status/:orderId
  if (req.method === 'GET' && pathname.startsWith('/api/payments/status/')) {
    const orderId = pathname.split('/').pop()
    const p = payments[orderId]
    if (!p) return json(res, 404, { status: 'not_found' })
    p.attempts = (p.attempts || 0) + 1
    if (p.attempts >= 2) {
      p.status = 'paid'
      const o = orders.find((x) => x.id === orderId)
      if (o) o.status = 'paid'
    }
    return json(res, 200, { status: p.status })
  }

  // Fallback
  json(res, 404, { message: 'Not implemented in mock server' })
})

server.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`)
})
