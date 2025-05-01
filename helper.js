const toTimeString = (sec, showMilliSeconds = false) => {
  sec = Number(sec);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const padded = (num) => (num < 10 ? "0" + num : num);

  const millisecMatch = (seconds % 1).toFixed(3).slice(1); // Get .xxx format

  return (
    padded(hours) +
    ":" +
    padded(minutes) +
    ":" +
    padded(Math.floor(seconds)) +
    (showMilliSeconds ? millisecMatch : "")
  );
};

const readFileAsBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const download = (url) => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "");
  link.click();
};

export { toTimeString, readFileAsBase64, download };
