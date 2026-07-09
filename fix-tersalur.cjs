const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the calculations for global stats to use pastDonations
const oldStats = `  // Dynamic stats calculations based on active programs
  const totalCollectedFromPrograms = activePrograms.reduce((sum, p) => sum + (p.collectedAmount || 0), 0);
  const totalDonorsFromPrograms = activePrograms.reduce((sum, p) => sum + (p.donorsCount || 0), 0);`;

const newStats = `  // Dynamic stats calculations based on actual donations
  const totalCollectedFromPrograms = pastDonations
    .filter(d => d.status === "Success")
    .reduce((sum, record) => sum + record.amount, 0);
  
  const totalDonorsFromPrograms = new Set(pastDonations.filter(d => d.status === "Success").map(d => d.donorName || "Hamba Allah")).size;`;

if (content.includes('const totalCollectedFromPrograms = activePrograms.reduce')) {
  content = content.replace(oldStats, newStats);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('Fixed tersalur stats in App.tsx');
} else {
  console.log('Could not find old stats code in App.tsx');
}
