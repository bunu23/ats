import { Prisma } from '@prisma/client';

export type ApplicationWithCandidate = Prisma.ApplicationGetPayload<
  Prisma.ApplicationDefaultArgs & { include: { candidate: true } }
>;

export type ApplicationWithCandidateAndJob = Prisma.ApplicationGetPayload<
  Prisma.ApplicationDefaultArgs & { include: { candidate: true; job: true } }
>;

export type JobWithApplications = Prisma.JobGetPayload<
  Prisma.JobDefaultArgs & { include: { applications: true } }
>;

export type CandidateWithApplications = Prisma.CandidateGetPayload<
  Prisma.CandidateDefaultArgs & { include: { applications: { include: { job: true } } } }
>;
