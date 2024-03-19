export const bytesToMegaBytes = (value) => {
  try {
    return (parseInt(value, 10) / 1048576).toFixed(3);
  } catch {
    return value;
  }
};
