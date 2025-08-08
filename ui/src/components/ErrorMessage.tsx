/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React from 'react';
import { Box, Alert } from '@mui/material';

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <Box my={2}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
}
