import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/public/policies:
 *   get:
 *     summary: Retrieve a list of public policies
 *     responses:
 *       200:
 *         description: A list of policies.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/policies', (req, res) => {
  // Mock data - replace with actual data from your policy engine
  const policies = [
    { id: 'pol1', name: 'Política de Acesso a Dados', description: 'Define quem pode acessar dados sensíveis.' },
    { id: 'pol2', name: 'Política de Retenção de Dados', description: 'Define por quanto tempo os dados são mantidos.' },
  ];
  res.json(policies);
});

export default router;
