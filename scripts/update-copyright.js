#!/usr/bin/env node

/*
 * Script para atualizar cabeçalhos de copyright existentes
 * Adiciona Dougla de Pinho Reck dos Santos como co-autor
 */

const fs = require('fs');
const path = require('path');

function updateCopyrightInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se já tem o novo formato
    if (content.includes('Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos')) {
      console.log(`✅ Já atualizado: ${filePath}`);
      return;
    }
    
    // Verificar se tem o formato antigo
    if (content.includes('Copyright (c) 2025 Carlos Antonio de Oliveira Piquet')) {
      const newContent = content.replace(
        'Copyright (c) 2025 Carlos Antonio de Oliveira Piquet',
        'Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos'
      );
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`🔄 Atualizado: ${filePath}`);
    } else {
      console.log(`⚪ Sem copyright: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorar node_modules e dist
        if (!item.includes('node_modules') && !item.includes('dist')) {
          processDirectory(fullPath);
        }
      } else {
        const ext = path.extname(fullPath);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          updateCopyrightInFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar diretório ${dirPath}:`, error.message);
  }
}

console.log('🔄 ATUALIZANDO CABEÇALHOS DE COPYRIGHT');
console.log('=====================================');
console.log('Adicionando: Dougla de Pinho Reck dos Santos como co-autor');

// Processar diretórios principais
const directories = ['./core/src', './ui/src', './agents'];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processando: ${dir}`);
    processDirectory(dir);
  }
});

console.log('\n✅ ATUALIZAÇÃO CONCLUÍDA!');
console.log('Todos os cabeçalhos foram atualizados com os co-autores.');
