// env.mock.js
export const mockEnv = {
    baseUrl: 'https://httpbin.org/get',
    apiKey: '123456-SECRET-KEY', // llave que usará el interceptor
    defaultHeaders: {
      'X-App-Name': 'MyAxiosClient'
    }
  };