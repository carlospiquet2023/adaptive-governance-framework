"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = exports.schema = void 0;
const graphql_1 = require("graphql");
const authService_1 = require("../app/authService");
const userRepoMemory_1 = require("../infra/userRepoMemory");
const policyService_1 = require("../app/policyService");
const authService = new authService_1.AuthService();
const userRepo = new userRepoMemory_1.UserRepoMemory();
const policyService = new policyService_1.PolicyService();
exports.schema = (0, graphql_1.buildSchema)(`
  type Policy {
    id: ID!
    name: String!
    rules: [String!]!
    context: String
    status: String!
  }
  type User {
    id: ID!
    username: String!
    role: String!
    permissions: [String!]!
  }
  type AuthPayload {
    token: String!
    role: String!
    permissions: [String!]!
  }
  type Query {
    policies: [Policy!]!
    me: User
  }
  type Mutation {
    login(username: String!, password: String!): AuthPayload
    createPolicy(name: String!, rules: [String!]!, context: String, status: String!): Policy
  }
`);
exports.root = {
    policies: (_, context) => {
        if (!context.user)
            throw new Error('Não autenticado');
        return policyService.list();
    },
    me: (_, context) => context.user,
    login: async ({ username, password }) => {
        const user = await userRepo.findByUsername(username);
        if (!user)
            throw new Error('Usuário ou senha inválidos');
        const valid = await authService.validatePassword(password, user.passwordHash);
        if (!valid)
            throw new Error('Usuário ou senha inválidos');
        const token = authService.generateToken(user);
        return { token, role: user.role, permissions: user.permissions };
    },
    createPolicy: ({ name, rules, context, status }, ctx) => {
        if (!ctx.user || !ctx.user.permissions.includes('manage:all'))
            throw new Error('Permissão negada');
        return policyService.create({ name, rules, context, status });
    }
};
//# sourceMappingURL=graphql.js.map