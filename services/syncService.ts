
import { Movie } from "../types";

export const fetchRemoteLibrary = async (url: string): Promise<Movie[] | null> => {
  if (!url) return null;
  try {
    const response = await fetch(`${url}?t=${Date.now()}`); // Prevent caching
    if (!response.ok) throw new Error("Sync failed");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.movies || null);
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    return null;
  }
};

/**
 * For Admin: Generates the JSON file to be uploaded to the cloud host.
 */
export const generateSyncPackage = (movies: Movie[]) => {
  const blob = new Blob([JSON.stringify(movies, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cinelaunch_master_vault.json';
  a.click();
};
