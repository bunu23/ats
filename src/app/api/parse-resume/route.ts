export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    // Simulate AI parsing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Try to extract a name from the file name (e.g., "Jane_Doe_Resume.pdf" -> "Jane Doe")
    let extractedName = 'Alex Developer';
    if (file.name) {
      const baseName = file.name.split('.')[0];
      const cleaned = baseName
        .replace(/[-_]/g, ' ')
        .replace(/resume|cv|document/gi, '')
        .trim();
      if (cleaned) {
        extractedName = cleaned.replace(/\b\w/g, c => c.toUpperCase());
      }
    }
    const extractedEmail = extractedName.toLowerCase().replace(/\s+/g, '.') + '@example.com';

    // Return a mock parsed payload dynamically based on file name
    return NextResponse.json(
      {
        success: true,
        data: {
          name: extractedName,
          email: extractedEmail,
          phone: '+1 555-0198',
          experience_years: '4',
          education: 'B.S. Computer Science, Tech University',
          skills: 'React, Node.js, Next.js, TypeScript, GraphQL, Python',
          resume_text: `[Extracted from ${file.name}]

${extractedName}
${extractedEmail} | +1 555-0198

SUMMARY
Passionate professional with 4 years of experience building scalable applications.

EXPERIENCE
Senior Engineer | Tech Innovators Inc. (2020 - Present)
- Led the migration of legacy SPA to Next.js, improving load times by 40%.
- Mentored junior developers and instituted code review best practices.

EDUCATION
B.S. Computer Science | Tech University (2016 - 2020)`
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
