/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import axios from 'axios';

export interface Webhook {
  url: string;
  event: string;
}

const webhooks: Webhook[] = [
  // Mock webhook for testing
  { url: 'https://httpbin.org/post', event: 'POLICY_VIOLATED' },
];

export async function triggerWebhooks(event: string, payload: any): Promise<void> {
  const relevantWebhooks = webhooks.filter((webhook) => webhook.event === event);

  for (const webhook of relevantWebhooks) {
    try {
      await axios.post(webhook.url, {
        event,
        payload,
      });
    } catch (error) {
      console.error(`Failed to send webhook to ${webhook.url}:`, error);
    }
  }
}
