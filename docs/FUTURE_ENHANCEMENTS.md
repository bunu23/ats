# Future Enhancements

This document tracks identified gaps and areas for future investment to elevate the ATS to a comprehensive enterprise-grade solution.

## 1. Infrastructure & Reliability Scaling

- **PostgreSQL Migration:** Transition the database from the local SQLite file (`prisma/dev.db`) to a managed PostgreSQL cluster (e.g., Supabase, Neon, or AWS RDS) to support distributed, multi-node production deployments.
- **Message Broker Upgrade:** Replace the current `setInterval` polling loop in `worker.js` with a dedicated distributed message broker (e.g., Redis, RabbitMQ, or Apache Kafka) to guarantee delivery, manage retries, and ensure massive horizontal scalability for delayed tasks.
- **TypeScript Migration:** Migrate the entire codebase from plain JavaScript to TypeScript to rigorously type Prisma database payloads and Next.js API responses, drastically reducing runtime errors.

## 2. AI-Assisted Job Creation

- **Dynamic Job Descriptions:** Implement an AI tool that assists recruiters in writing keyword-rich, SEO-optimized job descriptions tailored to attract top candidates based on industry trends.

## 3. Global Hiring & Globalization

- **Multiple Language Support (i18n):** Introduce internationalization to the candidate-facing portal to support global talent pools.

## 4. Expanded Integrations

- **Social Media Leverage:** Implement integrations with social networks (e.g., LinkedIn, Twitter) to automatically post job requisitions and allow candidates to "Apply with LinkedIn" to reduce friction.
- **Third-Party Screening:** Connect the pipeline to external screening APIs for automated background checks and pre-employment drug screenings.

## 5. Diversity, Equity, and Inclusion (DEI)

- **Intrinsic Bias Elimination:** Develop algorithms to scrub Personally Identifiable Information (PII) such as names, photos, and graduation years from resumes before they are presented to recruiters for initial screening.

## 6. Advanced Candidate Engagement

- **Mobile-First Chatbots:** Deploy a candidate-facing chatbot on the Careers page to handle FAQs and provide live support during the application process.
