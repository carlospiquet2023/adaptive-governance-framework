/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Policy } from '../core/policy';

export class PolicyService {
  private policies: Policy[] = [];

  list(): Policy[] {
    return this.policies;
  }

  create(data: Omit<Policy, 'id'>): Policy {
    const policy: Policy = { ...data, id: crypto.randomUUID() };
    this.policies.push(policy);
    return policy;
  }
}
