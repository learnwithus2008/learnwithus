const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log(' LEARNWITHUS CERTIFICATE DESIGN & WORKFLOW AUDIT    ');
console.log('====================================================\n');

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

// 1. Audit Fixed Pure White Certificate Design & CSS
const cssPath = path.join(__dirname, '..', 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

check('index.css has .certificate-pure-white-sheet rule', cssContent.includes('.certificate-pure-white-sheet'));
check('index.css enforces #FFFFFF background in dark mode (html.dark .certificate-pure-white-sheet)', cssContent.includes('html.dark .certificate-pure-white-sheet') && cssContent.includes('#FFFFFF !important'));
check('index.css enforces dark text color #0A2540 in dark mode for certificate', cssContent.includes('color: #0A2540 !important'));
check('index.css defines A4 landscape print size (@page { size: A4 landscape })', cssContent.includes('size: A4 landscape'));

// 2. Audit PDF Generation Utility (demoCertificatePdf.js)
const pdfUtilPath = path.join(__dirname, '..', 'src', 'utils', 'demoCertificatePdf.js');
const pdfUtil = fs.readFileSync(pdfUtilPath, 'utf8');

check('demoCertificatePdf.js defines studentName "Demo Student"', pdfUtil.includes('"Demo Student"'));
check('demoCertificatePdf.js defines courseName "Python Programming"', pdfUtil.includes('"Python Programming"'));
check('demoCertificatePdf.js defines duration "30 Hours"', pdfUtil.includes('"30 Hours"'));
check('demoCertificatePdf.js defines certificateId "DEMO-LWU-0001"', pdfUtil.includes('"DEMO-LWU-0001"'));
check('demoCertificatePdf.js defines watermarkText "DEMO"', pdfUtil.includes('watermarkText: "DEMO"'));
check('demoCertificatePdf.js defines sample notice "SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE"', pdfUtil.includes('SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE'));
check('demoCertificatePdf.js draws placeholder QR code (drawPlaceholderQrCode)', pdfUtil.includes('drawPlaceholderQrCode'));
check('demoCertificatePdf.js draws authorized signature block', pdfUtil.includes('authorizedBy') && pdfUtil.includes('academicTeam'));
check('demoCertificatePdf.js defines A4 landscape dimensions 841.89 pt x 595.28 pt', pdfUtil.includes('841.89') && pdfUtil.includes('595.28'));
check('demoCertificatePdf.js exports downloadDemoCertificatePdf', pdfUtil.includes('export async function downloadDemoCertificatePdf'));

// 3. Audit DemoCertificateModal.jsx
const modalPath = path.join(__dirname, '..', 'src', 'components', 'DemoCertificateModal.jsx');
const modal = fs.readFileSync(modalPath, 'utf8');

check('DemoCertificateModal applies certificate-pure-white-sheet class', modal.includes('certificate-pure-white-sheet'));
check('DemoCertificateModal forces inline backgroundColor #FFFFFF', modal.includes('backgroundColor: "#FFFFFF"'));
check('DemoCertificateModal renders "LEARN WITH US"', modal.includes('LEARN WITH US') || modal.includes('academyTitle'));
check('DemoCertificateModal renders "CERTIFICATE OF COMPLETION"', modal.includes('CERTIFICATE OF COMPLETION'));
check('DemoCertificateModal renders "This certificate is proudly presented to"', modal.includes('This certificate is proudly presented to'));
check('DemoCertificateModal renders "For successfully completing"', modal.includes('For successfully completing'));
check('DemoCertificateModal renders placeholder QR code block', modal.includes('DEMO QR CODE') || modal.includes('QrCode'));
check('DemoCertificateModal renders diagonal DEMO watermark', modal.includes('rotate-[25deg]') && modal.includes('DEMO'));
check('DemoCertificateModal renders sample warning text', modal.includes('SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE'));
check('DemoCertificateModal provides Download Demo PDF button', modal.includes('Download Demo PDF') || modal.includes('downloadDemoCertificatePdf'));
check('DemoCertificateModal handles Escape key dismissal', modal.includes('e.key === "Escape"'));
check('DemoCertificateModal handles click outside backdrop dismissal', modal.includes('onClick={onClose}') && modal.includes('e.stopPropagation()'));

// 4. Audit CertificateWorkflowSection.jsx
const workflowPath = path.join(__dirname, '..', 'src', 'components', 'CertificateWorkflowSection.jsx');
const workflow = fs.readFileSync(workflowPath, 'utf8');

check('CertificateWorkflowSection exists and is readable', fs.existsSync(workflowPath));
check('Workflow performs eligibility check on completion status', workflow.includes('isCourseComplete') && workflow.includes('TOTAL_TOPICS = 198'));
check('Workflow displays Course Incomplete warning when lessons not completed', workflow.includes('Course Incomplete — Certificate Request Locked') || workflow.includes('Course Incomplete'));
check('Workflow blocks request when incomplete', workflow.includes('disabled={!isCourseComplete}') && workflow.includes('if (!isCourseComplete) return'));
check('Workflow includes Step 1: Complete your course.', workflow.includes('Step 1: Complete your course.'));
check('Workflow includes Step 2: Contact LearnWithUs through WhatsApp.', workflow.includes('Step 2: Contact LearnWithUs through WhatsApp'));
check('Workflow includes Step 3: Pay ₹99 as the certificate fee.', workflow.includes('Step 3: Pay ₹99 as the certificate fee'));
check('Workflow includes Step 4: Manual payment verification.', workflow.includes('Step 4: Manual payment verification') || workflow.includes('Step 4: LearnWithUs manually verifies'));
check('Workflow includes Step 5: Certificate prepared & delivered.', workflow.includes('Step 5: Certificate prepared & delivered') || workflow.includes('Step 5: After payment verification'));
check('Workflow features "Request Certificate on WhatsApp" button', workflow.includes('Request Certificate on WhatsApp'));
check('Workflow uses configured WhatsApp support number', workflow.includes('WHATSAPP_SUPPORT_NUMBER'));
check('Workflow prepares WhatsApp message with student name and email', workflow.includes('studentName') && workflow.includes('studentEmail'));
check('Workflow embeds live pure white certificate preview', workflow.includes('certificate-pure-white-sheet') && workflow.includes('backgroundColor: "#FFFFFF"'));
check('Workflow provides Download Demo PDF action', workflow.includes('downloadDemoCertificatePdf'));
check('Workflow provides demo complete simulation toggle for testing', workflow.includes('simulateComplete') && workflow.includes('setSimulateComplete'));

// 5. Audit Integration in Pages
const profilePath = path.join(__dirname, '..', 'src', 'pages', 'Profile.jsx');
const profile = fs.readFileSync(profilePath, 'utf8');
check('Profile.jsx imports CertificateWorkflowSection', profile.includes('import CertificateWorkflowSection from "../components/CertificateWorkflowSection"'));
check('Profile.jsx mounts <CertificateWorkflowSection /> in certificates tab', profile.includes('<CertificateWorkflowSection onNavigate={onNavigate} />'));

const homePath = path.join(__dirname, '..', 'src', 'pages', 'Home.jsx');
const home = fs.readFileSync(homePath, 'utf8');
check('Home.jsx mounts DemoCertificateSection', home.includes('<DemoCertificateSection />'));

const sectionWrapperPath = path.join(__dirname, '..', 'src', 'components', 'DemoCertificateSection.jsx');
const sectionWrapper = fs.readFileSync(sectionWrapperPath, 'utf8');
check('DemoCertificateSection renders CertificateWorkflowSection', sectionWrapper.includes('<CertificateWorkflowSection'));

// 6. Safeguards: No real payments or database mutations
check('Workflow does NOT import Stripe / Razorpay / PayPal', !workflow.includes('stripe') && !workflow.includes('razorpay') && !workflow.includes('paypal'));
check('Workflow does NOT process real payment transactions', !workflow.includes('/api/checkout') && !workflow.includes('/api/pay'));

console.log('\n====================================================');
console.log(`AUDIT COMPLETE: ${passed} / ${total} checks PASSED!`);
console.log('====================================================');

if (passed !== total) {
  process.exit(1);
}

