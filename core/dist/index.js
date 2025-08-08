"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextEngine = exports.learningLoop = exports.policyEngine = void 0;
const index_1 = require("./policy_engine/index");
const index_2 = require("./learning_loop/index");
const index_3 = require("./context_engine/index");
// Exemplo de inicialização dos engines
const policyEngine = new index_1.PolicyEngine([]);
exports.policyEngine = policyEngine;
const learningLoop = new index_2.LearningLoop([]);
exports.learningLoop = learningLoop;
const contextEngine = new index_3.ContextEngine({});
exports.contextEngine = contextEngine;
console.log("Framework core iniciado com sucesso.");
//# sourceMappingURL=index.js.map