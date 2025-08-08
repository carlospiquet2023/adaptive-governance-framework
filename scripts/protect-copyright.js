#!/usr/bin/env node

/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

const fs = require('fs');
const path = require('path');

const COPYRIGHT_HEADER = `/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

`;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  // Ignorar node_modules e dist
  if (filePath.includes('node_modules') || filePath.includes('dist/')) {
    return false;
  }
  
  return allowedExtensions.includes(ext);
}

function hasExistingCopyright(content) {
  return content.includes('Copyright (c) 2025 Carlos Antonio de Oliveira Piquet');
}

function addCopyrightToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (hasExistingCopyright(content)) {
      console.log(`📄 Já protegido: ${filePath}`);
      return;
    }
    
    const newContent = COPYRIGHT_HEADER + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Protegido: ${filePath}`);
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
        processDirectory(fullPath);
      } else if (shouldProcessFile(fullPath)) {
        addCopyrightToFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar diretório ${dirPath}:`, error.message);
  }
}

console.log('🔒 INICIANDO PROTEÇÃO DE PROPRIEDADE INTELECTUAL');
console.log('===============================================');

// Processar diretórios principais
const directories = ['./core/src', './ui/src', './agents'];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processando: ${dir}`);
    processDirectory(dir);
  } else {
    console.log(`⚠️  Diretório não encontrado: ${dir}`);
  }
});

console.log('\n🎯 PROTEÇÃO APLICADA COM SUCESSO!');
console.log('Todos os arquivos de código-fonte foram protegidos com copyright.');
console.log('\n📧 Para licenciamento: carlospiquet.projetos@gmail.com');
