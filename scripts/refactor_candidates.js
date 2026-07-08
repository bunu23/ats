const fs = require('fs');

const pageContent = fs.readFileSync('src/app/(dashboard)/candidates/page.js', 'utf8');
const lines = pageContent.split('\n');

const tableStart =
  lines.findIndex(
    l =>
      l.includes('<div') &&
      lines[lines.indexOf(l) + 1] &&
      lines[lines.indexOf(l) + 1].includes("background: '#0f172a',")
  ) - 1;
const tableEnd =
  lines.findIndex(l => l.includes('No candidates found matching your criteria.')) + 3;

// Actually it's easier to just use the line numbers I have from `view_file`
// Lines 375-611 for Table
// Lines 613-1116 for Modal

const tableJSX = lines.slice(374, 611).join('\n');
const modalJSX = lines.slice(613, 1116).join('\n');

const tableComponent = `import React from 'react';

export default function CandidateTable({ filteredCandidates, getCandidateAppInfo, openModal }) {
  return (
${tableJSX}
  );
}
`;

const modalComponent = `import React from 'react';

export default function CandidateModal({ selectedCandidate, setSelectedCandidate, reviews, newReview, setNewReview, handleAddReview }) {
  return (
${modalJSX}
  );
}
`;

fs.mkdirSync('src/components/candidates', { recursive: true });
fs.writeFileSync('src/components/candidates/CandidateTable.js', tableComponent);
fs.writeFileSync('src/components/candidates/CandidateModal.js', modalComponent);

// Now replace them in page.js
const newPageLines = [
  ...lines.slice(0, 374),
  '      <CandidateTable',
  '        filteredCandidates={filteredCandidates}',
  '        getCandidateAppInfo={getCandidateAppInfo}',
  '        openModal={openModal}',
  '      />',
  ...lines.slice(611, 613),
  '      {selectedCandidate && (',
  '        <CandidateModal',
  '          selectedCandidate={selectedCandidate}',
  '          setSelectedCandidate={setSelectedCandidate}',
  '          reviews={reviews}',
  '          newReview={newReview}',
  '          setNewReview={setNewReview}',
  '          handleAddReview={handleAddReview}',
  '        />',
  '      )}',
  ...lines.slice(1116)
];

// Add imports
newPageLines.splice(
  2,
  0,
  "import CandidateTable from '../../../components/candidates/CandidateTable';"
);
newPageLines.splice(
  3,
  0,
  "import CandidateModal from '../../../components/candidates/CandidateModal';"
);

fs.writeFileSync('src/app/(dashboard)/candidates/page.js', newPageLines.join('\n'));
console.log('Refactor complete');
