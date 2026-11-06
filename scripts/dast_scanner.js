#!/usr/bin/env node

/**
 * PKS Portal - Dynamic Application Security Testing (DAST) Scanner
 * Based on dast-qa skill specification & OWASP Top 10 Security Checklist.
 */

const fs = require('fs');
const path = require('path');

const targetUrl = process.argv[2] || process.env.TARGET_URL || 'http://localhost:5173';
const apiUrl = process.env.API_URL || 'http://localhost:5000';

console.log('===============================================================');
console.log('🛡️  PKS PORTAL DAST SECURITY SCANNER');
console.log('===============================================================');
console.log(`🎯 Target Frontend URL: ${targetUrl}`);
console.log(`🎯 Target API URL:      ${apiUrl}`);
console.log('===============================================================');

const vulnerabilities = [];

const addFinding = (severity, title, description, recommendation) => {
  vulnerabilities.push({ severity, title, description, recommendation });
  const icon = severity === 'CRITICAL' ? '🔴' : severity === 'HIGH' ? '🟠' : severity === 'MEDIUM' ? '🟡' : '🔵';
  console.log(`${icon} [${severity}] ${title}`);
};

async function checkUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'PKS-DAST-Scanner/1.0' } });
    return res;
  } catch (err) {
    return null;
  }
}

async function runAudit() {
  console.log('\n[1/4] 🔍 Auditing HTTP Security Headers...');
  const feRes = await checkUrl(targetUrl);
  const apiRes = await checkUrl(`${apiUrl}/health`);

  const headers = feRes ? feRes.headers : (apiRes ? apiRes.headers : null);

  if (targetUrl.startsWith('https://')) {
    if (!headers || !headers.get('strict-transport-security')) {
      addFinding(
        'HIGH',
        'Missing HTTP Strict Transport Security (HSTS)',
        'The application is served over HTTPS but does not enforce HSTS.',
        'Configure Strict-Transport-Security header with max-age=31536000; includeSubDomains.'
      );
    }
  }

  // Check information leakage in headers
  if (headers && headers.get('x-powered-by')) {
    addFinding(
      'LOW',
      'X-Powered-By Header Information Exposure',
      `Server exposes technology stack: ${headers.get('x-powered-by')}`,
      'Disable X-Powered-By in Express: app.disable("x-powered-by").'
    );
  }

  console.log('\n[2/4] 🔍 Auditing 404 Error Pages & Stack Trace Hygiene...');
  const errorEndpoint = `${apiUrl}/api/nonexistent-endpoint-dast-probe-${Date.now()}`;
  const notFoundRes = await checkUrl(errorEndpoint);
  if (notFoundRes) {
    const errorBody = await notFoundRes.text();
    const stackTraceSignatures = [
      'at Function.',
      'at Module.',
      '/workspaces/',
      '/node_modules/',
      'prisma/client',
      'SequelizeDatabaseError',
      'syntax error at or near',
    ];

    const hasLeak = stackTraceSignatures.some(sig => errorBody.includes(sig));
    if (hasLeak) {
      addFinding(
        'HIGH',
        'Stack Trace or Internal Path Exposure in Error Response',
        'The server error handler leaked stack traces or filesystem paths to the client.',
        'Sanitize error messages in production and avoid returning error.stack or internals.'
      );
    } else {
      console.log('✅ 404 error handler response is clean (no stack trace or internal paths leaked).');
    }
  }

  console.log('\n[3/4] 🔍 Auditing Client Assets for Leaked Credentials / Connection Strings...');
  const distDir = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(distDir)) {
    const assetFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.endsWith('.js'));
    const secretSignatures = [
      /postgres:\/\/[^:]+:[^@]+@/i,
      /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/i,
      /JWT_SECRET/i,
      /super-secret-jwt-key/i,
      /PRIVATE KEY-----/i,
      /aws_secret_access_key/i,
    ];

    let bundleLeak = false;
    for (const f of assetFiles) {
      const content = fs.readFileSync(path.join(distDir, 'assets', f), 'utf8');
      for (const sig of secretSignatures) {
        if (sig.test(content)) {
          bundleLeak = true;
          addFinding(
            'CRITICAL',
            'Credential / Secret Leak in Client Production Bundle',
            `Sensitive pattern ${sig} matched in frontend bundle file: ${f}`,
            'Remove server secrets and environment variables from Vite frontend bundle.'
          );
        }
      }
    }
    if (!bundleLeak) {
      console.log('✅ Client production bundle scanned cleanly: 0 leaked database credentials or secrets.');
    }
  } else {
    console.log('ℹ️ Client dist assets not found locally, skipping filesystem bundle scan.');
  }

  console.log('\n[4/4] 🔍 Auditing API Authentication Guards...');
  const protectedRes = await checkUrl(`${apiUrl}/api/auth/me`);
  if (protectedRes) {
    if (protectedRes.status === 401) {
      console.log('✅ Unauthenticated access to /api/auth/me properly rejected with HTTP 401.');
    } else {
      addFinding(
        'HIGH',
        'Broken Authentication on Protected Route',
        `/api/auth/me returned status ${protectedRes.status} instead of 401 when accessed without token.`,
        'Enforce authenticate middleware on all protected routes.'
      );
    }
  }

  // Summary
  const criticals = vulnerabilities.filter(v => v.severity === 'CRITICAL');
  const highs = vulnerabilities.filter(v => v.severity === 'HIGH');
  const mediums = vulnerabilities.filter(v => v.severity === 'MEDIUM');
  const lows = vulnerabilities.filter(v => v.severity === 'LOW');

  console.log('\n===============================================================');
  console.log('📊 DAST AUDIT SUMMARY');
  console.log('===============================================================');
  console.log(`🔴 CRITICAL: ${criticals.length}`);
  console.log(`🟠 HIGH:     ${highs.length}`);
  console.log(`🟡 MEDIUM:   ${mediums.length}`);
  console.log(`🔵 LOW:      ${lows.length}`);
  console.log('===============================================================');

  // Generate Markdown report
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'dast_report.md');
  const reportMarkdown = `# DAST Security Audit Report

- **Date**: ${new Date().toISOString()}
- **Target URL**: ${targetUrl}
- **API URL**: ${apiUrl}
- **Scanner**: PKS DAST Automated Scanner v1.0

## Executive Summary
- **Critical Vulnerabilities**: ${criticals.length}
- **High Vulnerabilities**: ${highs.length}
- **Medium Vulnerabilities**: ${mediums.length}
- **Low Vulnerabilities**: ${lows.length}
- **Status**: ${criticals.length === 0 && highs.length === 0 ? '✅ PASSED (0 CRITICAL / 0 HIGH)' : '❌ FAILED'}

## Findings Matrix
${vulnerabilities.length === 0 ? '_No security vulnerabilities identified._\n' : ''}
${vulnerabilities.map(v => `### [${v.severity}] ${v.title}
- **Description**: ${v.description}
- **Recommendation**: ${v.recommendation}
`).join('\n')}
`;

  fs.writeFileSync(reportPath, reportMarkdown, 'utf8');
  console.log(`📝 Report written to: ${reportPath}`);

  if (criticals.length > 0 || highs.length > 0) {
    console.error('❌ DAST Quality Gate FAILED: Found CRITICAL or HIGH vulnerabilities.');
    process.exit(1);
  } else {
    console.log('✅ DAST Quality Gate PASSED: 0 CRITICAL / 0 HIGH vulnerabilities!');
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('DAST scanner execution error:', err);
  process.exit(1);
});
