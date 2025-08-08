export declare enum AuditEvent {
    POLICY_APPLIED = "POLICY_APPLIED",
    POLICY_VIOLATED = "POLICY_VIOLATED",
    USER_LOGIN = "USER_LOGIN",
    USER_LOGOUT = "USER_LOGOUT"
}
export interface AuditLog {
    timestamp: Date;
    event: AuditEvent;
    details: Record<string, any>;
}
export declare function logAuditEvent(event: AuditEvent, details: Record<string, any>): Promise<void>;
