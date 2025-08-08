export interface Policy {
    id: string;
    name: string;
    description: string;
    rules: PolicyRule[];
    context: PolicyContext;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    status: PolicyStatus;
}
export interface PolicyRule {
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
    enabled: boolean;
}
export interface PolicyContext {
    environment: string;
    region: string;
    serviceType: string;
    tags: Record<string, string>;
}
export declare enum PolicyStatus {
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED",
    DRAFT = "DRAFT",
    ARCHIVED = "ARCHIVED"
}
export interface Agent {
    id: string;
    type: AgentType;
    name: string;
    status: AgentStatus;
    capabilities: string[];
    context: Record<string, any>;
}
export declare enum AgentType {
    SECURITY = "SECURITY",
    PERFORMANCE = "PERFORMANCE",
    QUALITY = "QUALITY",
    ARCHITECT = "ARCHITECT"
}
export declare enum AgentStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    MAINTENANCE = "MAINTENANCE"
}
export interface MetricData {
    id: string;
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    tags: Record<string, string>;
    source: string;
}
export interface AdaptiveAction {
    id: string;
    type: ActionType;
    target: string;
    parameters: Record<string, any>;
    status: ActionStatus;
    result?: ActionResult;
    triggeredBy: string;
    timestamp: Date;
}
export declare enum ActionType {
    SCALE = "SCALE",
    NOTIFY = "NOTIFY",
    BLOCK = "BLOCK",
    OPTIMIZE = "OPTIMIZE",
    ROLLBACK = "ROLLBACK"
}
export declare enum ActionStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export interface ActionResult {
    success: boolean;
    message: string;
    data?: Record<string, any>;
    timestamp: Date;
}
