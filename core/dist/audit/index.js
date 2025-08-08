"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvent = void 0;
exports.logAuditEvent = logAuditEvent;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const logFilePath = (0, path_1.join)(__dirname, 'audit.log');
var AuditEvent;
(function (AuditEvent) {
    AuditEvent["POLICY_APPLIED"] = "POLICY_APPLIED";
    AuditEvent["POLICY_VIOLATED"] = "POLICY_VIOLATED";
    AuditEvent["USER_LOGIN"] = "USER_LOGIN";
    AuditEvent["USER_LOGOUT"] = "USER_LOGOUT";
})(AuditEvent || (exports.AuditEvent = AuditEvent = {}));
async function logAuditEvent(event, details) {
    const logEntry = {
        timestamp: new Date(),
        event,
        details,
    };
    try {
        await (0, promises_1.appendFile)(logFilePath, JSON.stringify(logEntry) + '\n');
    }
    catch (error) {
        console.error('Failed to write to audit log:', error);
    }
}
//# sourceMappingURL=index.js.map