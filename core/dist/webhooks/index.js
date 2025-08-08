"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerWebhooks = triggerWebhooks;
const axios_1 = __importDefault(require("axios"));
const webhooks = [
    // Mock webhook for testing
    { url: 'https://httpbin.org/post', event: 'POLICY_VIOLATED' },
];
async function triggerWebhooks(event, payload) {
    const relevantWebhooks = webhooks.filter((webhook) => webhook.event === event);
    for (const webhook of relevantWebhooks) {
        try {
            await axios_1.default.post(webhook.url, {
                event,
                payload,
            });
        }
        catch (error) {
            console.error(`Failed to send webhook to ${webhook.url}:`, error);
        }
    }
}
//# sourceMappingURL=index.js.map