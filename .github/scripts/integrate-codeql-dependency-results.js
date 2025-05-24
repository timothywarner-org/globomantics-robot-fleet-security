#!/usr/bin/env node
/**
 * Script to integrate CodeQL results with dependency vulnerability data
 * 
 * This script takes CodeQL SARIF results and correlates them with dependency
 * vulnerability information from npm audit and other sources to provide
 * enhanced context about potential vulnerability exploits.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CODEQL_RESULTS_DIR = process.env.CODEQL_RESULTS_DIR || './';
const NPM_AUDIT_FILE = process.env.NPM_AUDIT_FILE || './npm-audit-results.json';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './enhanced-results';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load dependency vulnerability data if available
let dependencyVulnerabilities = {};
try {
  if (fs.existsSync(NPM_AUDIT_FILE)) {
    const auditData = JSON.parse(fs.readFileSync(NPM_AUDIT_FILE, 'utf8'));
    
    // Extract advisories into a lookup format
    if (auditData.advisories) {
      dependencyVulnerabilities = auditData.advisories;
    }
    
    console.log(`Loaded ${Object.keys(dependencyVulnerabilities).length} vulnerabilities from npm audit`);
  }
} catch (err) {
  console.error('Error loading npm audit data:', err.message);
}

// Track packages used in vulnerable patterns
const vulnerablePackageUsage = new Map();

// Process CodeQL SARIF files
const processCodeqlResults = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`CodeQL results file not found: ${filePath}`);
      return null;
    }
    
    const sarifData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Process results
    const enhancedResults = {
      ...sarifData,
      runs: sarifData.runs.map(run => {
        // Process each result in the run
        const processedResults = run.results.map(result => {
          // Check if this result involves dependency usage
          const isDependencyRelated = isResultDependencyRelated(result);
          
          if (isDependencyRelated) {
            // Extract package name from the result if possible
            const packageName = extractPackageNameFromResult(result);
            
            if (packageName) {
              // Track this vulnerability for the package
              if (!vulnerablePackageUsage.has(packageName)) {
                vulnerablePackageUsage.set(packageName, []);
              }
              
              // Add result info to the package tracking
              vulnerablePackageUsage.get(packageName).push({
                ruleId: result.ruleId,
                message: result.message.text,
                severity: result.level,
                filePath: result.locations?.[0]?.physicalLocation?.artifactLocation?.uri || 'unknown'
              });
              
              // Add dependency vulnerability context to the result if available
              if (dependencyVulnerabilities[packageName]) {
                const vulnInfo = dependencyVulnerabilities[packageName];
                
                // Add vulnerability context to the message
                result.message.text += `\n\nThis finding is related to package '${packageName}' which has known vulnerabilities:\n`;
                result.message.text += `- Severity: ${vulnInfo.severity}\n`;
                result.message.text += `- CWEs: ${vulnInfo.cves?.join(', ') || 'N/A'}\n`;
                result.message.text += `- Recommendation: ${vulnInfo.recommendation || 'Update to a patched version'}\n`;
                
                // Increase severity if the vulnerability is critical or high
                if (['critical', 'high'].includes(vulnInfo.severity) && result.level !== 'error') {
                  result.level = 'error';
                  result.message.text += `\nNOTE: Severity increased due to critical/high dependency vulnerability`;
                }
              }
            }
          }
          
          return result;
        });
        
        return {
          ...run,
          results: processedResults
        };
      })
    };
    
    return enhancedResults;
  } catch (err) {
    console.error(`Error processing SARIF file ${filePath}:`, err.message);
    return null;
  }
};

// Helper: Check if a result is dependency-related
function isResultDependencyRelated(result) {
  // Check rule tags if available
  if (result.properties?.tags) {
    const tags = Array.isArray(result.properties.tags) 
      ? result.properties.tags 
      : [result.properties.tags];
      
    if (tags.some(tag => 
      ['external-api', 'library-execution', 'third-party', 'dependency'].includes(tag))) {
      return true;
    }
  }
  
  // Check rule ID for dependency-related patterns
  const dependencyRulePatterns = [
    'js/unsafe-jquery-plugin',
    'js/path-injection',
    'js/zipslip',
    'js/unsafe-deserialization',
    'js/prototype-pollution',
    'js/command-line-injection',
    'py/sql-injection',
    'py/path-injection',
    'py/unsafe-deserialization'
  ];
  
  if (dependencyRulePatterns.some(pattern => result.ruleId.includes(pattern))) {
    return true;
  }
  
  // Check message text for common package references
  if (result.message?.text) {
    const messageLower = result.message.text.toLowerCase();
    if (messageLower.includes('package') || 
        messageLower.includes('dependency') || 
        messageLower.includes('library') || 
        messageLower.includes('module')) {
      return true;
    }
  }
  
  return false;
}

// Helper: Extract package name from result
function extractPackageNameFromResult(result) {
  // Look for package names in code snippets
  if (result.locations?.length > 0) {
    const snippets = result.locations
      .filter(loc => loc.physicalLocation?.region?.snippet?.text)
      .map(loc => loc.physicalLocation.region.snippet.text);
    
    for (const snippet of snippets) {
      // Look for common import patterns
      const jsImportMatch = snippet.match(/require\(['"]([^'"]+)['"]\)|import.*?from\s+['"]([^'"]+)['"]/);
      if (jsImportMatch) {
        const modulePath = jsImportMatch[1] || jsImportMatch[2];
        // Extract root package name (e.g., 'lodash' from 'lodash/fp')
        const packageName = modulePath.split('/')[0];
        // Ignore relative imports
        if (!packageName.startsWith('.')) {
          return packageName;
        }
      }
      
      // Look for Python import patterns
      const pyImportMatch = snippet.match(/import\s+([^\s]+)|from\s+([^\s]+)\s+import/);
      if (pyImportMatch) {
        const moduleName = pyImportMatch[1] || pyImportMatch[2];
        // Extract root package name
        return moduleName.split('.')[0];
      }
    }
  }
  
  // Check rule description for package names
  if (result.message?.text) {
    const packageMatches = result.message.text.match(/['"]([a-zA-Z0-9_-]+)['"] package|module ['"]([a-zA-Z0-9_-]+)['"]/);
    if (packageMatches) {
      return packageMatches[1] || packageMatches[2];
    }
  }
  
  return null;
}

// Find and process all SARIF files
const processSarifFiles = () => {
  // List of SARIF files to check
  const sarifFiles = [
    path.join(CODEQL_RESULTS_DIR, 'javascript.sarif'),
    path.join(CODEQL_RESULTS_DIR, 'python.sarif')
  ];
  
  // Process each file
  for (const filePath of sarifFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${filePath}...`);
      const enhancedResults = processCodeqlResults(filePath);
      
      if (enhancedResults) {
        // Write enhanced SARIF file
        const outputPath = path.join(OUTPUT_DIR, path.basename(filePath));
        fs.writeFileSync(outputPath, JSON.stringify(enhancedResults, null, 2));
        console.log(`Enhanced results written to ${outputPath}`);
      }
    }
  }
  
  // Generate summary report
  generateSummaryReport();
};

// Generate summary report of findings
const generateSummaryReport = () => {
  const reportPath = path.join(OUTPUT_DIR, 'dependency-vulnerability-report.md');
  
  let report = `# Dependency Usage Vulnerability Report\n\n`;
  
  if (vulnerablePackageUsage.size === 0) {
    report += `No vulnerable dependency usage patterns detected.\n`;
  } else {
    report += `## Potentially Vulnerable Dependency Usage\n\n`;
    report += `The following dependencies are used in ways that could expose vulnerabilities:\n\n`;
    
    vulnerablePackageUsage.forEach((findings, packageName) => {
      report += `### ${packageName}\n\n`;
      
      // Add vulnerability info if available
      if (dependencyVulnerabilities[packageName]) {
        const vulnInfo = dependencyVulnerabilities[packageName];
        report += `**Vulnerability Information:**\n`;
        report += `- Severity: ${vulnInfo.severity || 'Unknown'}\n`;
        report += `- CVSS Score: ${vulnInfo.cvss_score || 'Not specified'}\n`;
        report += `- CVEs: ${vulnInfo.cves?.join(', ') || 'Not specified'}\n`;
        report += `- Vulnerable Versions: ${vulnInfo.vulnerable_versions || 'Unknown'}\n`;
        report += `- Patched Versions: ${vulnInfo.patched_versions || 'None available'}\n\n`;
      }
      
      report += `**Usage Patterns:**\n\n`;
      findings.forEach(finding => {
        report += `- ${finding.message} (${finding.severity})\n`;
        report += `  File: ${finding.filePath}\n\n`;
      });
      
      // Add remediation advice
      report += `**Remediation:**\n`;
      if (dependencyVulnerabilities[packageName]?.recommendation) {
        report += `${dependencyVulnerabilities[packageName].recommendation}\n\n`;
      } else {
        report += `- Update to the latest patched version\n`;
        report += `- Apply proper validation before passing data to this package\n`;
        report += `- Consider alternative packages if no patch is available\n\n`;
      }
    });
  }
  
  // Write report
  fs.writeFileSync(reportPath, report);
  console.log(`Summary report written to ${reportPath}`);
};

// Main execution
processSarifFiles(); 