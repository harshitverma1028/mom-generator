const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const createToken = userId => jwt.sign({ userId }, process.env.JWT_SECRET || 'development_secret_change_me', { expiresIn: '7d' })

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 10) })
    res.status(201).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) { next(error) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email?.toLowerCase().trim() })
    if (!user || !await bcrypt.compare(password || '', user.password)) return res.status(401).json({ message: 'Email or password is incorrect.' })
    res.json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) { next(error) }
})

module.exports = router
