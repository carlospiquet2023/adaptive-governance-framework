/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { appendFile } from 'fs/promises';
import { join } from 'path';

const logFilePath = join(__dirname, 'audit.log');

export enum AuditEvent {
  POLICY_APPLIED = 'POLICY_APPLIED',
  POLICY_VIOLATED = 'POLICY_VIOLATED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
}

export interface AuditLog {
  timestamp: Date;
  event: AuditEvent;
  details: Record<string, any>;
}

export async function logAuditEvent(event: AuditEvent, details: Record<string, any>): Promise<void> {
  const logEntry: AuditLog = {
    timestamp: new Date(),
    event,
    details,
  };

  try {
    await appendFile(logFilePath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to write to audit log:', error);
  }
}
