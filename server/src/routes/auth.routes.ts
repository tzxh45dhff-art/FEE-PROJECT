import { Router } from 'express'

import * as authController from '../controllers/auth.controller.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { byAddress, byAddressAndEmail, rateLimit } from '../middleware/rateLimit.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const authRoutes = Router()

const FIFTEEN_MINUTES = 15 * 60 * 1000

/* Ten tries at one account from one place, and a looser ceiling on the place itself. */
const loginPerAccount = rateLimit({ max: 10, windowMs: FIFTEEN_MINUTES, key: byAddressAndEmail, message: 'Too many sign-in attempts for this account. Wait a few minutes and try again.' })
const loginPerAddress = rateLimit({ max: 60, windowMs: FIFTEEN_MINUTES, key: byAddress, message: 'Too many sign-in attempts from here. Wait a few minutes and try again.' })
const signUps = rateLimit({ max: 10, windowMs: 60 * 60 * 1000, key: byAddress, message: 'Too many new accounts from here. Try again in an hour.' })

authRoutes.post('/register', signUps, asyncHandler(authController.register))
authRoutes.post('/login', loginPerAddress, loginPerAccount, asyncHandler(authController.login))
authRoutes.post('/logout', authController.logout)
authRoutes.get('/me', requireAuth, asyncHandler(authController.me))
authRoutes.get('/extension-token', requireAuth, authController.extensionToken)
