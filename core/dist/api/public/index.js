"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModelRegistry_1 = require("../../model_registry/ModelRegistry");
const XAIEngine_1 = require("../../xai/XAIEngine");
const PolicyEngine_1 = require("../../engines/PolicyEngine");
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
        { id: 'pol1', name: 'Política de Acesso a Dados', description: 'Define quem pode acessar dados sensíveis.' },
        { id: 'pol2', name: 'Política de Retenção de Dados', description: 'Define por quanto tempo os dados são mantidos.' },
    ];
    res.json(policies);
});
exports.default = router;
// Model Registry endpoints
router.get('/models', (_req, res) => {
    res.json(ModelRegistry_1.ModelRegistry.getInstance().list());
});
router.post('/models', (req, res) => {
    const info = ModelRegistry_1.ModelRegistry.getInstance().register(req.body);
    res.status(201).json(info);
});
router.post('/models/:id/activate', (req, res) => {
    ModelRegistry_1.ModelRegistry.getInstance().activate(req.params.id);
    res.status(204).send();
});
// XAI explain endpoint
router.post('/xai/explain', async (req, res) => {
    const engine = new PolicyEngine_1.PolicyEngine();
    const result = await engine.evaluate({ ...(req.body?.context || {}), timestamp: new Date() });
    const xai = new XAIEngine_1.XAIEngine();
    const exp = await xai.explainDecision(result);
    res.json(exp);
});
//# sourceMappingURL=index.js.map