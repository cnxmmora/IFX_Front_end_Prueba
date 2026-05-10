/**
 * config.js — Configuración del backend
 */

export const SALT_ROUND = parseInt(process.env.SALT_ROUND || '10', 10)

export const SECRET_KEY = process.env.SECRET_KEY || 'dev-secret-key-change-in-production-12345'

export const PORT = parseInt(process.env.PORT || '4000', 10)

export const VM_ADMIN_SIGNUP_KEY = process.env.VM_ADMIN_SIGNUP_KEY || undefined
