interface ILocalStorageUtils {
  getItem: <T>(key: string) => T | null;
  setItem: <T>(key: string, value: T) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

export const storageUtils: ILocalStorageUtils = {
  getItem: <T>(key: string) => {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  },

  setItem: <T>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },
};
