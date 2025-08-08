import client from 'prom-client';
export declare const register: client.Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const decisionLatency: client.Histogram<string>;
export declare const decisionsTotal: client.Counter<string>;
export declare const errorsTotal: client.Counter<string>;
