export declare const schema: import("graphql").GraphQLSchema;
export declare const root: {
    policies: (_: any, context: any) => import("../core/policy").Policy[];
    me: (_: any, context: any) => any;
    login: ({ username, password }: any) => Promise<{
        token: string;
        role: "admin" | "user";
        permissions: string[];
    }>;
    createPolicy: ({ name, rules, context, status }: any, ctx: any) => import("../core/policy").Policy;
};
