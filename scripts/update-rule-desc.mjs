import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating AI scoring rule description...');

  const rules = await prisma.automationRule.findMany({
    where: { name: 'Auto-score Candidates' }
  });

  if (rules.length > 0) {
    const description = `Evaluate candidates with AI on a 100-point scale:
• < 60: Queues 'Empathy Delay' 48h rejection and locks draggability.
• 60-85: Advances to 'AI Screening'.
• > 85: Fast-tracks directly to 'Phone Screening'.`;

    await prisma.automationRule.update({
      where: { id: rules[0].id },
      data: { description }
    });
    console.log('Updated Auto-score Candidates description successfully!');
  } else {
    console.log('Rule not found!');
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
