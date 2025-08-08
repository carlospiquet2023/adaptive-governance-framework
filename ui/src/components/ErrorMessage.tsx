import React from 'react';
import { Box, Alert } from '@mui/material';

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <Box my={2}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
}
