const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    return stripTrailingSlash(envUrl);
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)) {
      return 'http://localhost:1904';
    }

    const portSegment = port ? `:${port}` : '';
    return `${protocol}//${hostname}${portSegment}`;
  }

  return 'http://localhost:1904';
};

export default getApiBaseUrl;
