/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Router } from 'express';
import { ModelRegistry } from '../../model_registry/ModelRegistry';
import { XAIEngine } from '../../xai/XAIEngine';
import { PolicyEngine } from '../../engines/PolicyEngine';
import { requireTenant, checkLimit, trackUsage } from '../../saas';

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
    { 
      id: 'pol1', 
      name: 'Política de Acesso a Dados', 
      description: 'Define quem pode acessar dados sensíveis.',
      tenantId: req.tenant?.id || null
    },
    { 
      id: 'pol2', 
      name: 'Política de Retenção de Dados', 
      description: 'Define por quanto tempo os dados são mantidos.',
      tenantId: req.tenant?.id || null
    },
  ];
  res.json(policies);
});

export default router;

// Model Registry endpoints (require tenant and check limits)
router.get('/models', requireTenant, (req, res) => {
  // Filter models by tenant in production
  const models = ModelRegistry.getInstance().list();
  res.json(models.map(model => ({
    ...model,
    tenantId: req.tenant!.id
  })));
});

router.post('/models', requireTenant, checkLimit('canCreateModel'), trackUsage('models'), (req, res) => {
  // Add tenant context to model
  const modelData = {
    ...req.body,
    tenantId: req.tenant!.id
  };
  const info = ModelRegistry.getInstance().register(modelData);
  res.status(201).json(info);
});

router.post('/models/:id/activate', requireTenant, checkLimit('canCreateModel'), (req, res) => {
  // In production, verify model belongs to tenant
  ModelRegistry.getInstance().activate(req.params.id);
  res.status(204).send();
});

// XAI explain endpoint (check XAI access and track usage)
router.post('/xai/explain', requireTenant, checkLimit('hasXAI'), trackUsage('decisions'), async (req, res) => {
  try {
    const engine = new PolicyEngine();
    const context = { 
      ...(req.body?.context || {}), 
      timestamp: new Date(),
      tenantId: req.tenant!.id 
    };
    
    const result = await engine.evaluate(context as any);
    const xai = new XAIEngine();
    const explanation = await xai.explainDecision(result);
    
    res.json({
      ...explanation,
      tenantId: req.tenant!.id,
      planType: req.tenant!.planType
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message,
      code: 'XAI_ERROR' 
    });
  }
});
