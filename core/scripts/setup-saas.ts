import { tenantService } from '../src/saas/TenantService';
import { billingService } from '../src/saas/BillingService';

/**
 * Script de setup inicial para SaaS
 * Cria tenant de demonstração e dados de exemplo
 */
async function setupInitialData() {
  console.log('🚀 Setting up initial SaaS data...');

  try {
    // Criar tenant demo
    console.log('📋 Creating demo tenant...');
    const demoTenant = await tenantService.createTenant({
      name: 'Demo Company',
      subdomain: 'demo',
      ownerId: 'user_demo_owner',
      timezone: 'America/Sao_Paulo'
    });
    console.log(`✅ Demo tenant created: ${demoTenant.id} (${demoTenant.subdomain})`);

    // Criar tenant para testes
    console.log('📋 Creating test tenant...');
    const testTenant = await tenantService.createTenant({
      name: 'Test Corp',
      subdomain: 'test',
      ownerId: 'user_test_owner',
      timezone: 'UTC'
    });
    console.log(`✅ Test tenant created: ${testTenant.id} (${testTenant.subdomain})`);

    // Upgrade demo tenant para Pro (simular)
    console.log('💎 Upgrading demo tenant to Pro...');
    await tenantService.changePlan(demoTenant.id, 'pro');
    console.log('✅ Demo tenant upgraded to Pro plan');

    // Simular algum uso
    console.log('📊 Simulating usage...');
    await tenantService.incrementUsage(demoTenant.id, 'decisions');
    await tenantService.incrementUsage(demoTenant.id, 'decisions');
    await tenantService.incrementUsage(demoTenant.id, 'policies');
    await tenantService.incrementUsage(testTenant.id, 'decisions');

    // Mostrar dados finais
    console.log('\n📊 Final status:');
    
    const demoUsage = await tenantService.getCurrentUsage(demoTenant.id);
    const demoLimits = await tenantService.checkLimits(demoTenant.id);
    console.log('Demo tenant usage:', {
      decisions: demoUsage.decisionsCount,
      policies: demoUsage.policiesCount,
      limits: demoLimits
    });

    const testUsage = await tenantService.getCurrentUsage(testTenant.id);
    const testLimits = await tenantService.checkLimits(testTenant.id);
    console.log('Test tenant usage:', {
      decisions: testUsage.decisionsCount,
      policies: testUsage.policiesCount,
      limits: testLimits
    });

    console.log('\n✅ Setup completed successfully!');
    console.log('\n🌐 Access your tenants:');
    console.log(`- Demo (Pro plan): http://localhost:3000/tenant/demo`);
    console.log(`- Test (Free plan): http://localhost:3000/tenant/test`);
    console.log('\n📚 API endpoints:');
    console.log('- GET /api/saas/tenant (with x-tenant-subdomain header)');
    console.log('- GET /api/saas/plans');
    console.log('- POST /api/saas/billing/checkout');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  setupInitialData();
}

export { setupInitialData };
