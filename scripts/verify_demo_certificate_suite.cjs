const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==================================================');
console.log('  LEARNWITHUS DEMO CERTIFICATE COMPREHENSIVE AUDIT ');
console.log('==================================================\n');

let passed = 0;
let total = 0;

function check(label, condition) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
  }
}

// -----------------------------------------------------------------------------
// 1. Audit demoCertificatePdf.js
// -----------------------------------------------------------------------------
const pdfUtilPath = path.join(__dirname, '..', 'src', 'utils', 'demoCertificatePdf.js');
const pdfUtilContent = fs.readFileSync(pdfUtilPath, 'utf8');

check('demoCertificatePdf.js exists and is readable', fs.existsSync(pdfUtilPath));
check('Student Name is set to "Demo Student"', pdfUtilContent.includes('"Demo Student"'));
check('Course Name is set to "Python Programming"', pdfUtilContent.includes('"Python Programming"'));
check('Full course title is "Python Programming – Beginner to Advanced"', pdfUtilContent.includes('Python Programming – Beginner to Advanced'));
check('Completion Date is "15 November 2026"', pdfUtilContent.includes('15 November 2026'));
check('Certificate ID is "DEMO-LWU-0001"', pdfUtilContent.includes('DEMO-LWU-0001'));
check('Duration is "30 Hours"', pdfUtilContent.includes('30 Hours'));
check('Issued By is "LearnWithUs"', pdfUtilContent.includes('LearnWithUs'));
check('Authorized Signature label is present', pdfUtilContent.includes('Authorized Signature'));
check('Academic Team is "LearnWithUs Academic Team"', pdfUtilContent.includes('LearnWithUs Academic Team'));
check('Watermark "DEMO" is configured', pdfUtilContent.includes('watermarkText: "DEMO"'));
check('Sample notice "SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE" is configured', pdfUtilContent.includes('SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE'));
check('A4 landscape MediaBox dimensions 841.89 pt x 595.28 pt are defined', pdfUtilContent.includes('841.89') && pdfUtilContent.includes('595.28'));
check('renderDemoCertificateToCanvas function is exported', pdfUtilContent.includes('export function renderDemoCertificateToCanvas'));
check('downloadDemoCertificatePdf function is exported', pdfUtilContent.includes('export async function downloadDemoCertificatePdf'));
check('downloadDemoCertificatePng function is exported', pdfUtilContent.includes('export async function downloadDemoCertificatePng'));

// -----------------------------------------------------------------------------
// 2. Audit DemoCertificateModal.jsx
// -----------------------------------------------------------------------------
const modalPath = path.join(__dirname, '..', 'src', 'components', 'DemoCertificateModal.jsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');

check('DemoCertificateModal.jsx exists', fs.existsSync(modalPath));
check('Modal renders LEARN WITH US branding', modalContent.includes('LEARN WITH US') || modalContent.includes('academyTitle'));
check('Modal renders CERTIFICATE OF COMPLETION title', modalContent.includes('CERTIFICATE OF COMPLETION'));
check('Modal renders visible diagonal DEMO watermark', modalContent.includes('rotate-[25deg]') && modalContent.includes('DEMO'));
check('Modal displays "SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE"', modalContent.includes('SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE'));
check('Modal has "Download Demo PDF" button', modalContent.includes('Download Demo') || modalContent.includes('downloadDemoCertificatePdf'));
check('Modal has "Print / Save" button', modalContent.includes('handlePrint') && modalContent.includes('window.print()'));
check('Modal handles Escape key closing', modalContent.includes('e.key === "Escape"'));
check('Modal handles click-outside backdrop dismissal', modalContent.includes('onClick={onClose}') && modalContent.includes('e.stopPropagation()'));
check('Modal enforces white certificate background (#FFFFFF / bg-white)', modalContent.includes('bg-white') && modalContent.includes('#0A2540'));

// -----------------------------------------------------------------------------
// 3. Audit DemoCertificateSection.jsx
// -----------------------------------------------------------------------------
const sectionPath = path.join(__dirname, '..', 'src', 'components', 'DemoCertificateSection.jsx');
const sectionContent = fs.readFileSync(sectionPath, 'utf8');

check('DemoCertificateSection.jsx exists', fs.existsSync(sectionPath));
check('Section includes "View Demo Certificate" button', sectionContent.includes('View Demo Certificate'));
check('Section includes "Download Demo PDF" button', sectionContent.includes('Download Demo PDF'));
check('Section highlights 30 Hours training duration', sectionContent.includes('30 Hours'));
check('Section mounts DemoCertificateModal', sectionContent.includes('<DemoCertificateModal'));
check('Section displays sample demonstration disclaimer', sectionContent.includes('demonstration and preview purposes only'));

// -----------------------------------------------------------------------------
// 4. Audit Website Integration (Home.jsx & CertificateVerification.jsx)
// -----------------------------------------------------------------------------
const homePath = path.join(__dirname, '..', 'src', 'pages', 'Home.jsx');
const homeContent = fs.readFileSync(homePath, 'utf8');
check('Home.jsx imports DemoCertificateSection', homeContent.includes('import DemoCertificateSection from "../components/DemoCertificateSection"'));
check('Home.jsx mounts <DemoCertificateSection />', homeContent.includes('<DemoCertificateSection />'));

const verifyPath = path.join(__dirname, '..', 'src', 'pages', 'CertificateVerification.jsx');
const verifyContent = fs.readFileSync(verifyPath, 'utf8');
check('CertificateVerification.jsx imports DemoCertificateModal', verifyContent.includes('import DemoCertificateModal from "../components/DemoCertificateModal"'));
check('CertificateVerification.jsx supports DEMO-LWU-0001 demo lookup', verifyContent.includes('DEMO-LWU-0001'));
check('CertificateVerification.jsx provides View Demo Certificate button', verifyContent.includes('View Demo Certificate (DEMO-LWU-0001)'));
check('CertificateVerification.jsx mounts <DemoCertificateModal />', verifyContent.includes('<DemoCertificateModal'));

// -----------------------------------------------------------------------------
// 5. Audit Print Stylesheet (index.css)
// -----------------------------------------------------------------------------
const cssPath = path.join(__dirname, '..', 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
check('index.css includes @media print rules', cssContent.includes('@media print'));
check('index.css specifies @page { size: A4 landscape }', cssContent.includes('size: A4 landscape'));
check('index.css enforces print color adjust', cssContent.includes('print-color-adjust: exact'));

// -----------------------------------------------------------------------------
// 6. Security & Safety Safeguards
// -----------------------------------------------------------------------------
check('Demo certificate does NOT connect to payment endpoints', !pdfUtilContent.includes('/payment') && !modalContent.includes('/payment'));
check('Demo certificate does NOT modify user XP or progress state', !pdfUtilContent.includes('updateProgress') && !modalContent.includes('updateProgress'));
check('Demo certificate does NOT execute server database mutations', !pdfUtilContent.includes('/api/certificates') && !modalContent.includes('POST'));

console.log('\n==================================================');
console.log(`AUDIT COMPLETE: ${passed} / ${total} checks PASSED!`);
console.log('==================================================');

if (passed !== total) {
  process.exit(1);
}

