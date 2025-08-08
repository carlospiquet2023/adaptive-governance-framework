export interface Webhook {
    url: string;
    event: string;
}
export declare function triggerWebhooks(event: string, payload: any): Promise<void>;
