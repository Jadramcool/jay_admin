import jwt from 'jsonwebtoken'

const JWT_SECRET = 'jdm-admin-secret-key-2026'

export { JWT_SECRET }

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或token已过期', data: null })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  }
  catch {
    return res.status(401).json({ code: 401, message: 'token无效或已过期', data: null })
  }
}
