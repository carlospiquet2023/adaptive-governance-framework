"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_graphql_1 = require("express-graphql");
const graphql_1 = require("./graphql");
const authService_1 = require("../app/authService");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
const authService = new authService_1.AuthService();
app.use('/graphql', (0, express_graphql_1.graphqlHTTP)((req) => {
    let user = null;
    const auth = req.headers.authorization;
    if (auth) {
        try {
            const [, token] = auth.split(' ');
            user = authService.verifyToken(token);
        }
        catch { }
    }
    return {
        schema: graphql_1.schema,
        rootValue: graphql_1.root,
        context: { user },
        graphiql: true,
    };
}));
exports.default = app;
//# sourceMappingURL=app.js.map