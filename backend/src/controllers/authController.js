import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const register = async (req, res) => {
  const { email, password, role = 'staff', firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const pool = db.getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [email.trim().toLowerCase(), passwordHash, role, firstName || '', lastName || '']
    );

    const token = jwt.sign(
      { id: result.insertId, email: email.trim().toLowerCase(), role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, email: email.trim().toLowerCase(), role, name: firstName ? `${firstName} ${lastName || ''}`.trim() : email.split('@')[0] }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const pool = db.getPool();
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email.split('@')[0]
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};
