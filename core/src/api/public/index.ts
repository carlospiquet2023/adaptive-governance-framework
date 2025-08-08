import { Router } from 'express';
import { ModelRegistry } from '../../model_registry/ModelRegistry';
import { XAIEngine } from '../../xai/XAIEngine';
import { PolicyEngine } from '../../engines/PolicyEngine';

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

// Model Registry endpoints
router.get('/models', (_req, res) => {
  res.json(ModelRegistry.getInstance().list());
});

router.post('/models', (req, res) => {
  const info = ModelRegistry.getInstance().register(req.body);
  res.status(201).json(info);
});

router.post('/models/:id/activate', (req, res) => {
  ModelRegistry.getInstance().activate(req.params.id);
  res.status(204).send();
});

// XAI explain endpoint
router.post('/xai/explain', async (req, res) => {
  const engine = new PolicyEngine();
  const result = await engine.evaluate({ ...(req.body?.context||{}), timestamp: new Date() } as any);
  const xai = new XAIEngine();
  const exp = await xai.explainDecision(result);
  res.json(exp);
});
