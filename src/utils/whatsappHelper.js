/**
 * whatsappHelper.js
 * Centralized utility for WhatsApp doubt resolution & certificate verification redirects.
 * Builds prefilled messages containing Section Number, Lesson Name, Certificate Requests, and Paid Mentorship.
 */

// Support WhatsApp number (international format without '+' or non-digits)
// Easily customizable via VITE_WHATSAPP_NUMBER in .env or defaults to official support line
export const WHATSAPP_SUPPORT_NUMBER = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WHATSAPP_NUMBER) ||
  "917382008413"
).replace(/[^0-9]/g, "");

export const WHATSAPP_DISPLAY_NUMBER = "+91 73820 08413";

/**
 * Builds a structured, prefilled WhatsApp message for a lesson doubt.
 */
export function buildLessonDoubtMessage({
  sectionNumber,
  sectionTitle,
  lessonName,
  topicNumber,
  stepName,
  studentName,
  studentEmail
}) {
  const secNumDisplay = sectionNumber
    ? String(sectionNumber).replace(/^section\s*/i, "").trim()
    : "";

  const lines = [
    `*Python Adaptive — Ask a Doubt* 🐍`,
    ``,
    `📚 *Section:* ${secNumDisplay ? `Section ${secNumDisplay} — ` : ""}${sectionTitle || "Curriculum"}`,
    `📖 *Lesson:* ${lessonName || "Lesson"}${topicNumber ? ` (Ch #${topicNumber})` : ""}`
  ];

  if (stepName) {
    lines.push(`📍 *Step:* ${stepName}`);
  }

  if (studentName) {
    lines.push(`👤 *Student:* ${studentName}${studentEmail ? ` (${studentEmail})` : ""}`);
  }

  lines.push(``);
  lines.push(`💬 *My Doubt / Question:*`);
  lines.push(`Hi Learn With Us Team! I am studying this lesson and need some help understanding this concept. Could you please guide me?`);

  return lines.join("\n");
}

/**
 * Builds a structured, prefilled WhatsApp message for a section-level doubt.
 */
export function buildSectionDoubtMessage({
  sectionNumber,
  sectionTitle,
  studentName,
  studentEmail
}) {
  const secNumDisplay = sectionNumber
    ? String(sectionNumber).replace(/^section\s*/i, "").trim()
  : "";

  const lines = [
    `*Python Adaptive — Ask a Doubt* 🐍`,
    ``,
    `📚 *Section:* ${secNumDisplay ? `Section ${secNumDisplay} — ` : ""}${sectionTitle || "Curriculum"}`
  ];

  if (studentName) {
    lines.push(`👤 *Student:* ${studentName}${studentEmail ? ` (${studentEmail})` : ""}`);
  }

  lines.push(``);
  lines.push(`💬 *My Doubt / Question:*`);
  lines.push(`Hi Learn With Us Team! I am exploring this section and have a doubt regarding its concepts and roadmap. Could you please guide me?`);

  return lines.join("\n");
}

/**
 * Builds a structured prefilled WhatsApp message for Certificate Verification & Request (₹99)
 */
export function buildCertificateRequestMessage({
  studentName,
  studentEmail,
  courseName = "Python Programming & Adaptive Core Curriculum",
  completedCount = 198,
  totalTopics = 198,
  requestNumber = null
}) {
  const lines = [
    `*Learn With Us — Certificate of Achievement Request* 🎓`,
    ``,
    `👤 *Student Name:* ${studentName || "Python Learner"}`,
    `📧 *Registered Email:* ${studentEmail || "student@example.com"}`,
    `📚 *Course:* ${courseName}`,
    `✅ *Completion Status:* ${completedCount} of ${totalTopics} Topics Completed (${Math.min(100, Math.round((completedCount / totalTopics) * 100))}%)`,
    `💰 *Official Certificate Fee:* ₹99`,
    requestNumber ? `🔖 *Request Ref:* ${requestNumber}` : null,
    ``,
    `💬 *Student Message:*`,
    `Hello Learn With Us Academic Team! I have completed the curriculum and would like to request my official verified certificate. I am attaching/sharing my ₹99 payment confirmation for verification. Thank you!`
  ].filter(Boolean);

  return lines.join("\n");
}

/**
 * Builds a structured prefilled WhatsApp message for Paid Doubt Resolution (₹49)
 */
export function buildPaidDoubtRequestMessage({
  studentName,
  studentEmail,
  doubtNumber = null,
  ticketNumber = null,
  sectionTitle,
  lessonName,
  question,
  codeSnippet
}) {
  const lines = [
    `*Learn With Us — 1-on-1 Mentor Doubt Support* 💡`,
    ``,
    `👤 *Student Name:* ${studentName || "Learner"}`,
    `📧 *Registered Email:* ${studentEmail || "student@example.com"}`,
    doubtNumber ? `🔢 *Doubt Count:* Doubt #${doubtNumber} (Free 10 doubts used)` : `🔢 *Type:* 1-on-1 Dedicated Mentor Support`,
    `💰 *Mentorship Fee:* ₹49 per resolved doubt`,
    ticketNumber ? `🔖 *Ticket Ref:* ${ticketNumber}` : null,
    lessonName ? `📖 *Lesson/Topic:* ${lessonName} (${sectionTitle || "Curriculum"})` : null,
    ``,
    `💬 *My Question:*`,
    question ? `${question}` : `I need dedicated mentor guidance on this problem.`,
    codeSnippet ? `\n💻 *Code Snippet:*\n\`\`\`python\n${codeSnippet}\n\`\`\`` : null,
    ``,
    `Hello Learn With Us Mentors! I have used my 10 free doubts and am requesting dedicated ₹49 doubt resolution. I am attaching my payment details for verification.`
  ].filter(Boolean);

  return lines.join("\n");
}

/**
 * Opens WhatsApp in a new window/tab with the prefilled doubt message.
 */
export function openWhatsAppDoubt({
  sectionNumber,
  sectionTitle,
  lessonName,
  topicNumber,
  stepName,
  studentName,
  studentEmail,
  customMessage,
  phone = WHATSAPP_SUPPORT_NUMBER
}) {
  const targetPhone = (phone || WHATSAPP_SUPPORT_NUMBER).replace(/[^0-9]/g, "");

  let message = customMessage;
  if (!message) {
    if (lessonName) {
      message = buildLessonDoubtMessage({
        sectionNumber,
        sectionTitle,
        lessonName,
        topicNumber,
        stepName,
        studentName,
        studentEmail
      });
    } else {
      message = buildSectionDoubtMessage({
        sectionNumber,
        sectionTitle,
        studentName,
        studentEmail
      });
    }
  }

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

  if (typeof window !== "undefined") {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return whatsappUrl;
}

/**
 * Opens WhatsApp for Certificate Request (₹99)
 */
export function openWhatsAppCertificateRequest({
  studentName,
  studentEmail,
  courseName,
  completedCount,
  totalTopics,
  requestNumber,
  phone = WHATSAPP_SUPPORT_NUMBER
}) {
  const targetPhone = (phone || WHATSAPP_SUPPORT_NUMBER).replace(/[^0-9]/g, "");
  const message = buildCertificateRequestMessage({
    studentName,
    studentEmail,
    courseName,
    completedCount,
    totalTopics,
    requestNumber
  });

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  if (typeof window !== "undefined") {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }
  return whatsappUrl;
}

/**
 * Opens WhatsApp for Paid Doubt Support (₹49)
 */
export function openWhatsAppPaidDoubt({
  studentName,
  studentEmail,
  doubtNumber,
  ticketNumber,
  sectionTitle,
  lessonName,
  question,
  codeSnippet,
  phone = WHATSAPP_SUPPORT_NUMBER
}) {
  const targetPhone = (phone || WHATSAPP_SUPPORT_NUMBER).replace(/[^0-9]/g, "");
  const message = buildPaidDoubtRequestMessage({
    studentName,
    studentEmail,
    doubtNumber,
    ticketNumber,
    sectionTitle,
    lessonName,
    question,
    codeSnippet
  });

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  if (typeof window !== "undefined") {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }
  return whatsappUrl;
}
