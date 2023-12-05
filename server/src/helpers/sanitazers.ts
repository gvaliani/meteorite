export const sanitazeInteger = (num: unknown): number | null => {
  // Check if num is not undefined or null
  if (num === undefined || num === null) {
    return null;
  }

  const number = parseInt(`${num}`);

  // Check if the parsed value is a number and not NaN
  if (isNaN(number)) {
    return null;
  }

  return number;
}