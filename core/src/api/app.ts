/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import express from 'express';
import helmet from 'helmet';
import { graphqlHTTP } from 'express-graphql';
import { schema, root } from './graphql';
import { AuthService } from '../app/authService';

const app = express();
app.use(helmet());
app.use(express.json());

const authService = new AuthService();

app.use('/graphql', graphqlHTTP((req) => {
  let user = null;
  const auth = req.headers.authorization;
  if (auth) {
    try {
      const [, token] = auth.split(' ');
      user = authService.verifyToken(token);
    } catch {}
  }
  return {
    schema,
    rootValue: root,
    context: { user },
    graphiql: true,
  };
}));

export default app;
