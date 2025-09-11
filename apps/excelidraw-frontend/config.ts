
const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_HTTP_BACKEND) {
    return process.env.NEXT_PUBLIC_HTTP_BACKEND;
  }

  const port = process.env.HTTP_PORT || '3001';
  return `http://localhost:${port}`;
}

const getWebSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  return "ws://localhost:8080";
}

export const HTTP_BACKEND = getBackendUrl();
export const WS_URL = getWebSocketUrl();