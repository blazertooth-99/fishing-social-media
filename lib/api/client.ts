// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// if (!API_URL) {
//   throw new Error("NEXT_PUBLIC_API_URL is not defined");
// }

// interface RequestOptions extends RequestInit {
//   params?: Record<string, string | number | boolean | undefined>;
// }

// export async function apiClient<T>(
//   endpoint: string,
//   options: RequestOptions = {},
// ): Promise<T> {
//   const { params, ...fetchOptions } = options;

//   const url = new URL(`${API_URL}${endpoint}`);

//   if (params) {
//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== undefined) {
//         url.searchParams.set(key, String(value));
//       }
//     });
//   }

//   const response = await fetch(url.toString(), {
//     ...fetchOptions,

//     credentials: "include",

//     headers: {
//       Accept: "application/json",
//       ...fetchOptions.headers,
//     },
//   });

//   if (!response.ok) {
//     let message = `API Error: ${response.status}`;

//     try {
//       const error = await response.json();

//       if (error?.message) {
//         message = error.message;
//       }
//     } catch {
//       // Ignore invalid JSON response
//     }

//     throw new Error(message);
//   }

//   // Some endpoints may return empty response
//   if (response.status === 204) {
//     return undefined as T;
//   }

//   return response.json();
// }
