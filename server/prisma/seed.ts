import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Daily Report → Email',
    description: 'Schedule trigger → HTTP fetch data → Transform → Send Email',
    isTemplate: true,
    nodes: JSON.stringify([
      { id: '1', type: 'triggerNode', position: { x: 100, y: 100 }, data: { label: 'Schedule', category: 'trigger', nodeType: 'schedule', config: { cronExpression: '0 9 * * *' }, status: 'idle' } },
      { id: '2', type: 'actionNode', position: { x: 100, y: 250 }, data: { label: 'Fetch Report Data', category: 'action', nodeType: 'http_request', config: { url: 'https://api.example.com/reports/daily', method: 'GET' }, status: 'idle' } },
      { id: '3', type: 'actionNode', position: { x: 100, y: 400 }, data: { label: 'Format HTML', category: 'action', nodeType: 'transform_data', config: { expression: 'return `<h1>Daily Report</h1><p>${JSON.stringify(data)}</p>`;' }, status: 'idle' } },
      { id: '4', type: 'actionNode', position: { x: 100, y: 550 }, data: { label: 'Send to Team', category: 'action', nodeType: 'send_email', config: { to: 'team@example.com', subject: 'Daily Report', body: '{{data}}', isHtml: true }, status: 'idle' } },
    ]),
    edges: JSON.stringify([
      { id: 'e1-2', source: '1', target: '2', type: 'animatedEdge', animated: true },
      { id: 'e2-3', source: '2', target: '3', type: 'animatedEdge', animated: true },
      { id: 'e3-4', source: '3', target: '4', type: 'animatedEdge', animated: true },
    ]),
  },
  {
    name: 'Webhook → Clean → Save',
    description: 'Webhook trigger → Transform data → Write to JSON file',
    isTemplate: true,
    nodes: JSON.stringify([
      { id: '1', type: 'triggerNode', position: { x: 100, y: 100 }, data: { label: 'Incoming Webhook', category: 'trigger', nodeType: 'webhook', config: { path: '/lead', method: 'POST' }, status: 'idle' } },
      { id: '2', type: 'actionNode', position: { x: 100, y: 250 }, data: { label: 'Clean Data', category: 'action', nodeType: 'transform_data', config: { expression: 'return { email: data.email?.toLowerCase(), name: data.name?.trim() };' }, status: 'idle' } },
      { id: '3', type: 'actionNode', position: { x: 100, y: 400 }, data: { label: 'Save Lead', category: 'action', nodeType: 'write_file', config: { filename: 'leads.json', format: 'json', append: true }, status: 'idle' } },
    ]),
    edges: JSON.stringify([
      { id: 'e1-2', source: '1', target: '2', type: 'animatedEdge', animated: true },
      { id: 'e2-3', source: '2', target: '3', type: 'animatedEdge', animated: true },
    ]),
  },
  {
    name: 'Conditional Alert',
    description: 'Manual trigger → HTTP check → Condition → Send Email (if true)',
    isTemplate: true,
    nodes: JSON.stringify([
      { id: '1', type: 'triggerNode', position: { x: 250, y: 100 }, data: { label: 'Run Check', category: 'trigger', nodeType: 'manual', config: { inputData: '{}' }, status: 'idle' } },
      { id: '2', type: 'actionNode', position: { x: 250, y: 250 }, data: { label: 'Check Status', category: 'action', nodeType: 'http_request', config: { url: 'https://api.example.com/status', method: 'GET' }, status: 'idle' } },
      { id: '3', type: 'logicNode', position: { x: 250, y: 400 }, data: { label: 'Is Down?', category: 'logic', nodeType: 'condition', config: { expression: 'return data.status !== "ok";' }, status: 'idle' } },
      { id: '4', type: 'actionNode', position: { x: 100, y: 550 }, data: { label: 'Alert Admin', category: 'action', nodeType: 'send_email', config: { to: 'admin@example.com', subject: 'System Down!', body: 'Status check failed.' }, status: 'idle' } },
      { id: '5', type: 'actionNode', position: { x: 400, y: 550 }, data: { label: 'Log Success', category: 'action', nodeType: 'transform_data', config: { expression: 'console.log("All good!"); return data;' }, status: 'idle' } },
    ]),
    edges: JSON.stringify([
      { id: 'e1-2', source: '1', target: '2', type: 'animatedEdge', animated: true },
      { id: 'e2-3', source: '2', target: '3', type: 'animatedEdge', animated: true },
      { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', type: 'animatedEdge', animated: true },
      { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', type: 'animatedEdge', animated: true },
    ]),
  }
];

async function main() {
  console.log('Seeding templates...');
  for (const t of templates) {
    const exists = await prisma.workflow.findFirst({ where: { name: t.name, isTemplate: true } });
    if (!exists) {
      await prisma.workflow.create({ data: t });
      console.log(`Created template: ${t.name}`);
    }
  }
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
