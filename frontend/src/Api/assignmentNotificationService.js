/**
 * assignmentNotificationService.js
 *
 * Targeted notification helpers used when a teacher creates or
 * updates a homework portal.
 *
 *   • send(payload)                       → POST /api/school-notifications/send
 *   • scheduleReminder(payload, deadline) → POST /api/school-notifications/schedule-reminder
 */

import axios from "./axiosConfig";

const BASE = "http://localhost:7000/api/school-notifications";

/**
 * Immediately dispatch a targeted notification to every student
 * in the given grade + section.
 *
 * @param {{
 *   title: string,
 *   message: string,
 *   sender: string,
 *   targetGrade: string,
 *   targetSection: string,
 *   payload?: object
 * }} opts
 */
export const sendAssignmentNotification = async ({
  title,
  message,
  sender,
  targetGrade,
  targetSection,
  payload,
}) => {
  try {
    await axios.post(`${BASE}/send`, {
      title,
      message,
      sender,
      targetGrade,
      targetSection,
      payload: payload ?? null,
    });
  } catch (err) {
    // Non-fatal – a notification failure must never block assignment creation.
    console.error(
      "[AssignmentNotification] send failed:",
      err?.response?.data ?? err.message
    );
  }
};

/**
 * Ask the server to send a reminder notification exactly 24 hours
 * before `deadline`.  The backend uses setTimeout internally.
 *
 * @param {{
 *   title: string,
 *   message: string,
 *   sender: string,
 *   targetGrade: string,
 *   targetSection: string,
 *   payload?: object
 * }} opts
 * @param {string|Date} deadline  ISO date string of the assignment close time
 */
export const scheduleDeadlineReminder = async (
  { title, message, sender, targetGrade, targetSection, payload },
  deadline
) => {
  try {
    await axios.post(`${BASE}/schedule-reminder`, {
      title,
      message,
      sender,
      targetGrade,
      targetSection,
      payload: payload ?? null,
      deadline: new Date(deadline).toISOString(),
    });
  } catch (err) {
    console.error(
      "[AssignmentNotification] scheduleReminder failed:",
      err?.response?.data ?? err.message
    );
  }
};
