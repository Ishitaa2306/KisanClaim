/**
 * Weather Intelligence Engine
 * 
 * Transforms raw weather parameters into actionable agricultural risk events.
 * Provides a clean, flexible rule structure.
 */

/**
 * Evaluates weather conditions to detect crop risk events.
 * 
 * @param {Object} weatherData - Contains temperature, rainfall, humidity, condition.
 * @returns {Object} { eventType, severity, eventDate }
 */
function analyzeWeatherRisk(weatherData) {
  const { temperature, rainfall, humidity } = weatherData;
  const today = new Date().toISOString().split('T')[0];

  let eventType = 'Normal Conditions';
  let severity = 'None';

  // Rule 1: Extreme Rainfall leading to Flood Risk
  if (rainfall >= 70) {
    eventType = 'Flood Risk';
    severity = 'Critical';
  }
  // Rule 2: Heavy Rain
  else if (rainfall >= 40) {
    eventType = 'Heavy Rain';
    severity = 'High';
  }
  // Rule 3: Extreme Heat Stress
  else if (temperature >= 42) {
    eventType = 'Extreme Heat Stress';
    severity = 'Critical';
  }
  // Rule 4: Moderate Heat Stress
  else if (temperature >= 38) {
    eventType = 'Heat Stress';
    severity = 'Medium';
  }
  // Rule 5: Drought Risk (High temp, low humidity, zero rainfall)
  else if (temperature >= 35 && humidity <= 35 && rainfall === 0) {
    eventType = 'Drought Risk';
    severity = 'High';
  }
  // Rule 6: Pest favorable conditions (Warm and very humid)
  else if (temperature >= 28 && temperature <= 32 && humidity >= 80 && rainfall < 10) {
    eventType = 'Pest Attack Risk';
    severity = 'Medium';
  }
  // Rule 7: Moderate Rain (beneficial or minor risk depending on crop stage, but categorized as Low risk here)
  else if (rainfall >= 15) {
    eventType = 'Moderate Rain';
    severity = 'Low';
  }

  return {
    eventType,
    severity,
    eventDate: today, // By default, the risk event is detected as of today based on current data
  };
}

module.exports = {
  analyzeWeatherRisk,
};
