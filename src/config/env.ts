export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  DOWNLOAD_URL_WINDOWS: import.meta.env.VITE_DOWNLOAD_URL_WINDOWS ?? "#",
  DOWNLOAD_URL_MACOS: import.meta.env.VITE_DOWNLOAD_URL_MACOS ?? "#",
  DOWNLOAD_URL_LINUX: import.meta.env.VITE_DOWNLOAD_URL_LINUX ?? "#",
};
