/**
 * Date Utility for generating satellite analysis windows based on event dates.
 */

/**
 * Validates and parses a date string or object into a Date instance.
 * @param {string|Date} dateInput
 * @returns {Date}
 */
function parseDate(dateInput) {
  if (!dateInput) return new Date();
  
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    console.warn(`[DateUtils] Invalid date provided: ${dateInput}, falling back to current date.`);
    return new Date();
  }
  return parsed;
}

/**
 * Generates an analysis window around a specific event date.
 * Allows flexibility for past dates (testing/historical) and defaults to current date.
 * 
 * @param {string|Date} [eventDateInput] - Optional override for the event date.
 * @returns {Object} { eventDate, beforeDate, afterDate } in YYYY-MM-DD format.
 */
function generateAnalysisWindow(eventDateInput = null) {
  const eventDate = parseDate(eventDateInput);

  // beforeDate: 10 to 20 days prior
  // We use a pseudo-random approach based on the date's timestamp to keep it deterministic for the same date
  const randomSeed = eventDate.getTime();
  const pseudoRandom = (min, max) => Math.floor(Math.abs(Math.sin(randomSeed)) * (max - min + 1)) + min;
  
  const daysBefore = pseudoRandom(10, 20);
  const beforeDateObj = new Date(eventDate);
  beforeDateObj.setDate(beforeDateObj.getDate() - daysBefore);

  // afterDate: 2 to 5 days after
  const daysAfter = pseudoRandom(2, 5);
  const afterDateObj = new Date(eventDate);
  afterDateObj.setDate(afterDateObj.getDate() + daysAfter);

  return {
    eventDate: eventDate.toISOString().split('T')[0],
    beforeDate: beforeDateObj.toISOString().split('T')[0],
    afterDate: afterDateObj.toISOString().split('T')[0],
  };
}

module.exports = {
  parseDate,
  generateAnalysisWindow,
};
