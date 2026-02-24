const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { signToken } = require('../config/jwt');

const SALT_ROUNDS = 10;

/**
 * Đăng ký tài khoản mới
 */
const register = async ({ username, email, password, role = 'customer' }) => {
    // Kiểm tra email đã tồn tại chưa
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        throw new Error('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
    );

    return { id: result.insertId, username, email, role };
};

/**
 * Đăng nhập – trả về JWT token
 */
const login = async ({ email, password }) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new Error('Email hoặc mật khẩu không đúng');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không đúng');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
};

module.exports = { register, login };