const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'Please sign in to continue.' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'development_secret_change_me')
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}
