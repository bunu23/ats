---
name: candidate-scoring
description: AI-powered candidate evaluation and fit scoring. Analyzes candidate qualifications against job requirements to produce a fit score with detailed reasoning.
---

# Candidate Scoring Skill

This skill evaluates candidate-job fit using AI analysis.

## Scoring Dimensions

1. **Skills Match** (0-10): How well the candidate's skills align with job requirements
2. **Experience Relevance** (0-10): Years and type of experience vs. what's needed
3. **Education Fit** (0-10): Educational background alignment
4. **Overall Fit** (0-10): Weighted composite score

## Output Format

```json
{
  "overallScore": 8,
  "dimensions": {
    "skillsMatch": 9,
    "experienceRelevance": 7,
    "educationFit": 8
  },
  "strengths": ["Strong backend experience", "Relevant industry knowledge"],
  "gaps": ["Limited cloud experience"],
  "recommendation": "Strong candidate — recommend advancing to interview stage"
}
```

## Usage

- Triggered automatically when a new application is created
- Can be re-run manually from the candidate detail view
- Score is displayed on the pipeline Kanban card
