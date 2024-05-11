import { FastifyInstance } from 'fastify'
import { authenticate } from './controllers/authenticate'
import { clientRegister } from './controllers/client-register'
import { clients } from './controllers/clients'
import { createAppointment } from './controllers/create-appointment'
import { createHealthQuestionnaire } from './controllers/create-health-questionnaire'
import { skinForm } from './controllers/skin-form'
import { userProfile } from './controllers/user-profile'
import { userRegister } from './controllers/user-register'
import { verifyJWT } from './middlewares/verify-jwt'

export async function appRoutes(app: FastifyInstance) {
  app.get('/clients', clients)
  // app.post('/clients', clientRegister)

  app.get('/users', userProfile)
  app.post('/users', userRegister)
  app.post('/sessions', authenticate)

  app.post('/clients', clientRegister)
  app.post('/skin-form', skinForm)


  // Authenticated Routes
  app.get('/me', userProfile)
  // app.get('/users', { onRequest: [verifyJWT] }, users)
  app.post('/appointments', { onRequest: [verifyJWT] }, createAppointment)
  app.post('/health-questionnairies', createHealthQuestionnaire)
}
