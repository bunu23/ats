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

    // Return a mock parsed payload
    return NextResponse.json(
      {
        success: true,
        data: {
          name: 'Alex Developer',
          email: 'alex.dev@example.com',
          phone: '+1 555-0198',
          experience_years: '4',
          education: 'B.S. Computer Science, Tech University',
          skills: 'React, Node.js, Next.js, TypeScript, GraphQL, Python',
          resume_text: `[Extracted from ${file.name}]

Alex Developer
alex.dev@example.com | +1 555-0198

SUMMARY
Passionate full-stack developer with 4 years of experience building scalable web applications.

EXPERIENCE
Senior Frontend Engineer | Tech Innovators Inc. (2020 - Present)
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
