export interface Policy {
  id: string;
  name: string;
  rules: string[];
  context: Record<string, any>;
  status: 'ACTIVE' | 'DISABLED';
}
