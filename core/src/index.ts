import { PolicyEngine } from './policy_engine/index';
import { LearningLoop } from './learning_loop/index';
import { ContextEngine } from './context_engine/index';

// Exemplo de inicialização dos engines
const policyEngine = new PolicyEngine([]);
const learningLoop = new LearningLoop([]);
const contextEngine = new ContextEngine({});

console.log('Framework core iniciado com sucesso.');

export { policyEngine, learningLoop, contextEngine };
