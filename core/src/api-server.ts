import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const integrationLogs: any[] = [];

const users = [
  { username: 'admin', password: 'admin', role: 'admin', token: 'admin-token' },
  { username: 'user', password: 'user', role: 'user', token: 'user-token' },
];

const policies = [
  { name: 'Maintainability', value: 85 },
  { name: 'Security', value: 95 },
  { name: 'Performance', value: 90 },
];

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    res.status(200).json({ token: user.token, role: user.role });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.get('/policies', (req, res) => {
  res.status(200).json(policies);
});

app.post('/users', (req, res) => {
  const { username, password, role } = req.body;
  if (users.find((u) => u.username === username)) {
    res.status(409).json({ error: 'Usuário já existe' });
    return;
  }
  const token = `${username}-token`;
  users.push({ username, password, role, token });
  res.status(201).json({ token, role });
});

app.get('/logs', (req, res) => {
  res
    .status(200)
    .json([
      { event: 'login', user: 'admin', date: new Date() },
      ...integrationLogs,
    ]);
});

app.post('/integrations/slack', (req, res) => {
  const { message } = req.body;
  integrationLogs.push({
    provider: 'slack',
    type: 'send',
    message,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', sent: true, provider: 'slack', message });
});

app.post('/integrations/github', (req, res) => {
  const payload = req.body;
  integrationLogs.push({
    provider: 'github',
    type: 'receive',
    event: payload,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', received: true, provider: 'github', event: payload });
});

app.post('/integrations/teams', (req, res) => {
  const { message } = req.body;
  integrationLogs.push({
    provider: 'teams',
    type: 'send',
    message,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', sent: true, provider: 'teams', message });
});

app.post('/integrations/jira', (req, res) => {
  const payload = req.body;
  integrationLogs.push({
    provider: 'jira',
    type: 'receive',
    event: payload,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', received: true, provider: 'jira', event: payload });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Core online' });
});

app.listen(3000, () => {
  console.log('API core mock rodando em http://localhost:3000');
});
