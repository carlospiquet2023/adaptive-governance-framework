"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionStatus = exports.ActionType = exports.AgentStatus = exports.AgentType = exports.PolicyStatus = void 0;
var PolicyStatus;
(function (PolicyStatus) {
    PolicyStatus["ACTIVE"] = "ACTIVE";
    PolicyStatus["DISABLED"] = "DISABLED";
    PolicyStatus["DRAFT"] = "DRAFT";
    PolicyStatus["ARCHIVED"] = "ARCHIVED";
})(PolicyStatus || (exports.PolicyStatus = PolicyStatus = {}));
var AgentType;
(function (AgentType) {
    AgentType["SECURITY"] = "SECURITY";
    AgentType["PERFORMANCE"] = "PERFORMANCE";
    AgentType["QUALITY"] = "QUALITY";
    AgentType["ARCHITECT"] = "ARCHITECT";
})(AgentType || (exports.AgentType = AgentType = {}));
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["ACTIVE"] = "ACTIVE";
    AgentStatus["INACTIVE"] = "INACTIVE";
    AgentStatus["MAINTENANCE"] = "MAINTENANCE";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var ActionType;
(function (ActionType) {
    ActionType["SCALE"] = "SCALE";
    ActionType["NOTIFY"] = "NOTIFY";
    ActionType["BLOCK"] = "BLOCK";
    ActionType["OPTIMIZE"] = "OPTIMIZE";
    ActionType["ROLLBACK"] = "ROLLBACK";
})(ActionType || (exports.ActionType = ActionType = {}));
var ActionStatus;
(function (ActionStatus) {
    ActionStatus["PENDING"] = "PENDING";
    ActionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ActionStatus["COMPLETED"] = "COMPLETED";
    ActionStatus["FAILED"] = "FAILED";
})(ActionStatus || (exports.ActionStatus = ActionStatus = {}));
//# sourceMappingURL=types.js.map