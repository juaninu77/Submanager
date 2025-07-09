// lib/storage.ts
// Utilidades seguras y tipadas para acceder a localStorage

export const storage = {
  /**
   * Obtiene un valor de localStorage y lo devuelve como tipo T.
   * Si la clave no existe o el parseo falla, se devuelve `defaultValue`.
   */
  getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue

    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue

    // 1º intentamos parsear como JSON;
    // si no es JSON válido, devolvemos la cadena tal cual.
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  },

  /**
   * Guarda un valor en localStorage serializándolo a JSON.
   */
  setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error(`Error writing localStorage key “${key}”:`, err)
    }
  },

  /**
   * Elimina una clave de localStorage.
   */
  removeItem(key: string): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error(`Error removing localStorage key “${key}”:`, err)
    }
  },
}
