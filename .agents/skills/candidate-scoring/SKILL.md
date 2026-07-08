---
name: candidate-scoring
description: AI-powered candidate evaluation and fit scoring. Analyzes candidate qualifications against job requirements to produce a fit score with detailed reasoning.
---

# Candidate Scoring Skill

This skill evaluates candidate-job fit using AI analysis.

## Scoring Dimensions

1. **Skills Match** (0-100): How well the candidate's skills align with job requirements
2. **Experience Relevance** (0-100): Years and type of experience vs. what's needed
3. **Education Fit** (0-100): Educational background alignment
4. **Overall Fit** (0-100): Weighted composite score determining pipeline routing

## Routing Logic Guidelines
- **Score < 59**: Below Threshold (Triggers Auto-Reject guardrails)
- **Score 60-85**: Good Fit (Advances to Screening)
- **Score > 85**: Exceptional Fit (Fast-tracks to Phone Screening)

## Output Format

```json
{
  "overallScore": 88,
  "dimensions": {
    "skillsMatch": 95,
    "experienceRelevance": 82,
    "educationFit": 90
  },
  "strengths": ["Strong backend experience", "Relevant industry knowledge"],
  "gaps": ["Limited cloud experience"],
  "recommendation": "Exceptional candidate — fast-track to phone screening."
}
```

## Usage

- Triggered automatically when a new application is created
- Can be re-run manually from the candidate detail view
- Score is displayed on the pipeline Kanban card
