/**
 * whatsappHelper.js
 * Centralized utility for WhatsApp doubt resolution redirects.
 * Builds prefilled messages containing Section Number, Lesson Name, and default student inquiries.
 */

// Support WhatsApp number (international format without '+' or non-digits)
// Easily customizable via VITE_WHATSAPP_NUMBER in .env or defaults to a standard support line
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

