"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModelRegistry_1 = require("../../model_registry/ModelRegistry");
const XAIEngine_1 = require("../../xai/XAIEngine");
const PolicyEngine_1 = require("../../engines/PolicyEngine");
const saas_1 = require("../../saas");
const router = (0, express_1.Router)();
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
exports.default = router;
// Model Registry endpoints (require tenant and check limits)
router.get('/models', saas_1.requireTenant, (req, res) => {
    // Filter models by tenant in production
    const models = ModelRegistry_1.ModelRegistry.getInstance().list();
    res.json(models.map(model => ({
        ...model,
        tenantId: req.tenant.id
    })));
});
router.post('/models', saas_1.requireTenant, (0, saas_1.checkLimit)('canCreateModel'), (0, saas_1.trackUsage)('models'), (req, res) => {
    // Add tenant context to model
    const modelData = {
        ...req.body,
        tenantId: req.tenant.id
    };
    const info = ModelRegistry_1.ModelRegistry.getInstance().register(modelData);
    res.status(201).json(info);
});
router.post('/models/:id/activate', saas_1.requireTenant, (0, saas_1.checkLimit)('canCreateModel'), (req, res) => {
    // In production, verify model belongs to tenant
    ModelRegistry_1.ModelRegistry.getInstance().activate(req.params.id);
    res.status(204).send();
});
// XAI explain endpoint (check XAI access and track usage)
router.post('/xai/explain', saas_1.requireTenant, (0, saas_1.checkLimit)('hasXAI'), (0, saas_1.trackUsage)('decisions'), async (req, res) => {
    try {
        const engine = new PolicyEngine_1.PolicyEngine();
        const context = {
            ...(req.body?.context || {}),
            timestamp: new Date(),
            tenantId: req.tenant.id
        };
        const result = await engine.evaluate(context);
        const xai = new XAIEngine_1.XAIEngine();
        const explanation = await xai.explainDecision(result);
        res.json({
            ...explanation,
            tenantId: req.tenant.id,
            planType: req.tenant.planType
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message,
            code: 'XAI_ERROR'
        });
    }
});
//# sourceMappingURL=index.js.map