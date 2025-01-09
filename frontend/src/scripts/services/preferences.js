export function setDarkModePreference(isDarkMode) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `darkMode=${
    isDarkMode ? 1 : 0
  }; expires=${expires.toUTCString()}; path=/`;
}
export function getDarkModePreference() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("darkMode="))
      ?.split("=")[1] === "1"
  );
}
