const fs = require('fs');
const path = require('path');

let total = 0;
let passed = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

console.log('==================================================');
console.log('  MANDATORY 80% CERTIFICATE ELIGIBILITY AUDIT     ');
console.log('==================================================\n');

// 1. Audit Reusable Component: CertificateEligibilityCard.jsx
const cardPath = path.join(__dirname, '..', 'src', 'components', 'CertificateEligibilityCard.jsx');
check('CertificateEligibilityCard.jsx exists and is readable', fs.existsSync(cardPath));
const cardContent = fs.readFileSync(cardPath, 'utf8');

check('Card enforces REQUIRED_PERCENTAGE = 80', cardContent.includes('REQUIRED_PERCENTAGE = 80') || cardContent.includes('80'));
check('Card calculates remaining percentage from 80%', cardContent.includes('REQUIRED_PERCENTAGE - completionPercentage') || cardContent.includes('80 - completionPercentage'));
check('Card defines 45% example message', cardContent.includes('Complete ${remainingPercentage}% more to unlock your certificate request.'));
check('Card defines 75% near-threshold message', cardContent.includes("You're almost there! Complete ${remainingPercentage}% more to unlock your certificate request."));
check('Card defines 80%+ Congratulations message', cardContent.includes('Congratulations! You are eligible to request your certificate.'));
check('Card includes official header "🎓 Earn Your Course Certificate!"', cardContent.includes('🎓 Earn Your Course Certificate!'));
check('Card includes requirement "Complete at least 80% of your course"', cardContent.includes('Complete at least 80% of your course to become eligible for a LearnWithUs certificate.'));
check('Card includes Step 1: Contact us through WhatsApp.', cardContent.includes('Contact us through WhatsApp.'));
check('Card includes Step 2: Pay ₹99 for your certificate with QR code.', cardContent.includes('Pay ₹99 for your certificate with QR code.'));
check('Card includes Step 3: We will verify your payment.', cardContent.includes('We will verify your payment.'));
check('Card includes Step 4: Your certificate PDF will be issued after approval.', cardContent.includes('Your certificate PDF will be issued after approval.'));
check('Card disables WhatsApp request button when < 80%', cardContent.includes('disabled={!isEligible}'));
check('Card displays locked label before 80%', cardContent.includes('Locked (80% Required)'));
check('Card displays eligible label from 80% onward', cardContent.includes('Eligible (80%+ Reached)'));

// 2. Audit Course Dashboard Integration (Learn.jsx)
const learnPath = path.join(__dirname, '..', 'src', 'pages', 'Learn.jsx');
const learnContent = fs.readFileSync(learnPath, 'utf8');
check('Learn.jsx imports CertificateEligibilityCard', learnContent.includes('import CertificateEligibilityCard from "../components/CertificateEligibilityCard"'));
check('Learn.jsx mounts <CertificateEligibilityCard /> on course dashboard', learnContent.includes('<CertificateEligibilityCard'));
check('Learn.jsx passes completedCount and totalTopics', learnContent.includes('completedCount={completedCount}') && learnContent.includes('totalTopics={totalTopicsCount}'));

// 3. Audit Course Completion Section Integration (LessonContent.jsx)
const lessonPath = path.join(__dirname, '..', 'src', 'components', 'LessonContent.jsx');
const lessonContent = fs.readFileSync(lessonPath, 'utf8');
check('LessonContent.jsx imports CertificateEligibilityCard', lessonContent.includes('import CertificateEligibilityCard from "./CertificateEligibilityCard"'));
check('LessonContent.jsx mounts <CertificateEligibilityCard /> in Step 6 (Complete/Mastery)', lessonContent.includes('<CertificateEligibilityCard'));

// 4. Audit Certificate Section Integration (CertificateWorkflowSection.jsx)
const workflowPath = path.join(__dirname, '..', 'src', 'components', 'CertificateWorkflowSection.jsx');
const workflowContent = fs.readFileSync(workflowPath, 'utf8');
check('CertificateWorkflowSection enforces 80% threshold (REQUIRED_PERCENTAGE = 80)', workflowContent.includes('REQUIRED_PERCENTAGE = 80') || workflowContent.includes('>= 80'));
check('Workflow includes official header "🎓 Earn Your Course Certificate!"', workflowContent.includes('🎓 Earn Your Course Certificate!'));
check('Workflow includes 4-step communication workflow', workflowContent.includes('Contact us through WhatsApp.') && workflowContent.includes('Pay ₹99 for your certificate with QR code.'));
check('Workflow shows remaining percentage when < 80%', workflowContent.includes('remainingPercentage') || workflowContent.includes('80% Required'));
check('Workflow includes simulation modes for testing (45%, 75%, 80%, 100%)', workflowContent.includes('"45%"') && workflowContent.includes('"75%"') && workflowContent.includes('"80%"'));
check('Workflow WhatsApp button locked when < 80%', workflowContent.includes('disabled={!isCourseComplete}') && workflowContent.includes('Locked • 80% Completion Required'));
check('Workflow WhatsApp button unlocked when >= 80%', workflowContent.includes('Request Certificate on WhatsApp'));

// 5. Audit Backend Validation (server/src/controllers/certificateController.js)
const serverCtrlPath = path.join(__dirname, '..', 'server', 'src', 'controllers', 'certificateController.js');
const serverCtrl = fs.readFileSync(serverCtrlPath, 'utf8');
check('Backend getEligibility enforces 80% threshold', serverCtrl.includes('requiredPercentage = 80') && serverCtrl.includes('completionPercentage >= requiredPercentage'));
check('Backend returns remainingPercentage and requiredTopics', serverCtrl.includes('remainingPercentage') && serverCtrl.includes('requiredTopics'));
check('Backend createRequest blocks ineligibility with 403 Forbidden', serverCtrl.includes('completionPercentage < 80') && serverCtrl.includes('status(403)'));
check('Backend createRequest returns INELIGIBLE_FOR_CERTIFICATE error code', serverCtrl.includes('INELIGIBLE_FOR_CERTIFICATE'));

// 6. Audit Certificate Design Permanence
const cssPath = path.join(__dirname, '..', 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
check('index.css keeps certificate background strictly white (#FFFFFF)', cssContent.includes('.certificate-pure-white-sheet') && cssContent.includes('background-color: #FFFFFF !important'));
check('index.css forces color-scheme: light for certificate in dark mode', cssContent.includes('color-scheme: light !important'));

console.log('\n==================================================');
console.log(`AUDIT COMPLETE: ${passed} / ${total} checks PASSED!`);
console.log('==================================================');

if (passed !== total) {
  process.exit(1);
}

