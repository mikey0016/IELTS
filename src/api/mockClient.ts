/**
 * Mock API client.
 *
 * Simulates network latency so UI loading states are exercised.
 * When a real backend is ready, replace the domain modules in
 * `src/api` with real `fetch` calls — components don't need to change.
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "";

export function mockRequest<T>(producer: () => T, delay = 500): Promise<T> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(producer());
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}

export function mockCollection<T>(items: T[], delay = 500): Promise<T[]> {
  return mockRequest(() => [...items], delay);
}

export function mockItem<T>(item: T, delay = 400): Promise<T> {
  return mockRequest(() => item, delay);
}

export class MockApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MockApiError";
  }
}
