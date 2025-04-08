export function extractTotalScoreFromMixedString(mixedString) {
  // Basic validation for the input string
  if (mixedString == null || typeof mixedString !== 'string') {
    console.error("Input must be a non-null string.");
    return null;
  }

  let totalScore = null; // Initialize variable

  try {
    // Step 1: Find the index of the first opening curly brace '{'
    const startIndex = mixedString.indexOf('{');

    // Step 2: Find the index of the last closing curly brace '}'
    const endIndex = mixedString.lastIndexOf('}');

    // Step 3: Check if both braces were found and in the correct order
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error("Could not find a valid JSON structure (missing '{' or '}' or incorrect order) in the string.");
      return null;
    }

    // Step 4: Extract the substring that likely contains the JSON
    // Add 1 to endIndex because substring/slice's end index is exclusive
    const jsonSubstring = mixedString.substring(startIndex, endIndex + 1);

    // --- Optional: Add a log to see what was extracted ---
    // console.log("Attempting to parse JSON substring:", jsonSubstring);

    // Step 5: Parse the extracted substring
    const dataObject = JSON.parse(jsonSubstring);

    // Step 6: Access the 'Total Score' value using bracket notation
    if (dataObject && dataObject.hasOwnProperty('Total Score')) {
      totalScore = dataObject['Total Score'];
      // console.log("Successfully extracted Total Score:", totalScore); // Optional log
    } else {
      console.log("'Total Score' key not found in the extracted JSON data.");
      totalScore = undefined; // Or keep as null
    }

  } catch (error) {
    // Handle potential errors:
    // - String manipulation errors (less likely here)
    // - JSON.parse errors if the extracted substring is not valid JSON
    console.error("Error processing string or parsing JSON substring:", error);
    totalScore = null;
  }

  return totalScore;
}
