import { Prisma } from '@prisma/client';

export type ApplicationWithCandidate = Prisma.ApplicationGetPayload<{
  include: { candidate: true };
}>;

export type ApplicationWithCandidateAndJob = Prisma.ApplicationGetPayload<{
  include: { candidate: true; job: true };
}>;

export type JobWithApplications = Prisma.JobGetPayload<{
  include: { applications: true };
}>;

export type CandidateWithApplications = Prisma.CandidateGetPayload<{
  include: { applications: { include: { job: true } } };
}>;
