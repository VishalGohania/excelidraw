
const getBackendUrl = () => {
  const port = process.env.HTTP_PORT || '3001';
  return `http://localhost:${port}`;
}

export const HTTP_BACKEND = getBackendUrl();
export const WS_URL = "ws://localhost:8080";