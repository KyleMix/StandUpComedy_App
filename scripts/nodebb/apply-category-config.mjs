#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const [, , configPathArg] = process.argv;

if (!configPathArg) {
  console.error('Usage: NODEBB_BASE_URL=... NODEBB_WRITE_TOKEN=... node scripts/nodebb/apply-category-config.mjs <config.json>');
  process.exit(1);
}

const baseUrl = process.env.NODEBB_BASE_URL;
const token = process.env.NODEBB_WRITE_TOKEN;

if (!baseUrl || !token) {
  console.error('Both NODEBB_BASE_URL and NODEBB_WRITE_TOKEN environment variables are required.');
  process.exit(1);
}

const configPath = path.resolve(configPathArg);
const raw = await fs.readFile(configPath, 'utf8');
const config = JSON.parse(raw);

function printCurl(command) {
  process.stdout.write(`${command}\n\n`);
}

for (const category of config.categories || []) {
  const payload = {
    name: category.name,
    description: category.description,
    parentCid: category.parentCid ?? 0,
    order: category.order ?? 0,
    slug: category.slug,
  };
  const payloadJson = JSON.stringify(payload).replace(/"/g, '\\"');

  const createCommand = [
    `curl -X POST "${baseUrl}/api/v3/categories"`,
    `-H "Authorization: Bearer ${token}"`,
    '-H "Content-Type: application/json"',
    `-d "${payloadJson}"`,
  ].join(' \\\n  ');
  const createCurl = [
    `# Create or update category: ${category.name}`,
    `  ${createCommand}`,
    '# Note: If the category already exists, replace POST with PUT and append the CID: /api/v3/categories/<cid>'
  ].join('\n');
  printCurl(createCurl);

  const privileges = category.privileges ? JSON.stringify(category.privileges).replace(/"/g, '\\"') : null;
  if (privileges) {
    const privilegeCommand = [
      `curl -X PUT "${baseUrl}/api/v3/categories/<cid>/privileges"`,
      `-H "Authorization: Bearer ${token}"`,
      '-H "Content-Type: application/json"',
      `-d "${privileges}"`,
    ].join(' \\\n  ');
    const privilegeCurl = [
      `# Set privileges for ${category.name} (replace <cid> with the numeric cid returned above)`,
      `  ${privilegeCommand}`,
    ].join('\n');
    printCurl(privilegeCurl);
  }

  if (category.topicTemplate) {
    const templateBody = JSON.stringify({ topicTemplate: category.topicTemplate }).replace(/"/g, '\\"');
    const templateCommand = [
      `curl -X PUT "${baseUrl}/api/v3/categories/<cid>/settings"`,
      `-H "Authorization: Bearer ${token}"`,
      '-H "Content-Type: application/json"',
      `-d "${templateBody}"`,
    ].join(' \\\n  ');
    const templateCurl = [
      `# Apply topic template for ${category.name}`,
      `  ${templateCommand}`,
    ].join('\n');
    printCurl(templateCurl);
  }
}

if (config.calendar) {
  const calendarCurl = [
    '# Calendar integration requires nodebb-plugin-calendar to be installed and enabled.',
    '# Configure category mapping via the plugin API (replace <cid> tokens accordingly).',
    `# Recommended payload: ${JSON.stringify(config.calendar)}`
  ].join('\n');
  printCurl(calendarCurl);
}
