#!/usr/bin/env node

const os = require('os');
const { buildDoctorReport } = require('./lib/install-lifecycle');
const { SUPPORTED_INSTALL_TARGETS } = require('./lib/install-manifests');
const { getInstallTargetAdapter } = require('./lib/install-targets/registry');

function showHelp(exitCode = 0) {
  console.log(`
Usage: node scripts/doctor.js [--target <${SUPPORTED_INSTALL_TARGETS.join('|')}>] [--profile entrepreneur-codex] [--json]

Diagnose drift and missing managed files for ECC install-state in the current context.
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    targets: [],
    profileId: null,
    json: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--target') {
      parsed.targets.push(args[index + 1] || null);
      index += 1;
    } else if (arg === '--profile') {
      const profileId = args[index + 1];
      if (!profileId || profileId.startsWith('-')) {
        throw new Error('Missing value for --profile');
      }
      parsed.profileId = profileId;
      index += 1;
    } else if (arg === '--json') {
      parsed.json = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (parsed.profileId && parsed.profileId !== 'entrepreneur-codex') {
    throw new Error(`Unsupported lifecycle profile: ${parsed.profileId}`);
  }
  if (parsed.profileId) {
    if (parsed.targets.length === 0) {
      parsed.targets.push('codex');
    } else if (parsed.targets.some(target => getInstallTargetAdapter(target).target !== 'codex')) {
      throw new Error('The entrepreneur-codex lifecycle profile only supports the Codex target');
    }
  }

  return parsed;
}

function statusLabel(status) {
  if (status === 'ok') {
    return 'OK';
  }

  if (status === 'warning') {
    return 'WARNING';
  }

  if (status === 'error') {
    return 'ERROR';
  }

  return status.toUpperCase();
}

function printHuman(report) {
  if (report.results.length === 0) {
    console.log('No ECC install-state files found for the current home/project context.');
    return;
  }

  console.log('Doctor report:\n');
  for (const result of report.results) {
    console.log(`- ${result.adapter.id}`);
    console.log(`  Status: ${statusLabel(result.status)}`);
    console.log(`  Install-state: ${result.installStatePath}`);

    if (result.issues.length === 0) {
      console.log('  Issues: none');
      continue;
    }

    for (const issue of result.issues) {
      console.log(`  - [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
  }

  console.log(`\nSummary: checked=${report.summary.checkedCount}, ok=${report.summary.okCount}, warnings=${report.summary.warningCount}, errors=${report.summary.errorCount}`);
}

function main() {
  try {
    const options = parseArgs(process.argv);
    if (options.help) {
      showHelp(0);
    }

    const report = buildDoctorReport({
      repoRoot: require('path').join(__dirname, '..'),
      homeDir: process.env.HOME || os.homedir(),
      projectRoot: process.cwd(),
      targets: options.targets,
      profileId: options.profileId,
    });
    const hasIssues = report.summary.errorCount > 0 || report.summary.warningCount > 0;

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHuman(report);
    }

    process.exitCode = hasIssues ? 1 : 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
