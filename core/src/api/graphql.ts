/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { buildSchema } from 'graphql';
import { AuthService } from '../app/authService';
import { UserRepoMemory } from '../infra/userRepoMemory';
import { PolicyService } from '../app/policyService';

const authService = new AuthService();
const userRepo = new UserRepoMemory();
const policyService = new PolicyService();

export const schema = buildSchema(`
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

export const root = {
  policies: (_: any, context: any) => {
    if (!context.user) throw new Error('Não autenticado');
    return policyService.list();
  },
  me: (_: any, context: any) => context.user,
  login: async ({ username, password }: any) => {
    const user = await userRepo.findByUsername(username);
    if (!user) throw new Error('Usuário ou senha inválidos');
    const valid = await authService.validatePassword(password, user.passwordHash);
    if (!valid) throw new Error('Usuário ou senha inválidos');
    const token = authService.generateToken(user);
    return { token, role: user.role, permissions: user.permissions };
  },
  createPolicy: ({ name, rules, context, status }: any, ctx: any) => {
    if (!ctx.user || !ctx.user.permissions.includes('manage:all')) throw new Error('Permissão negada');
    return policyService.create({ name, rules, context, status });
  }
};
