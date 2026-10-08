export async function executeHttpRequest(config: any, input: any) {
  let url = config.url;
  
  // Basic templating support e.g. https://api.example.com/users/{{userId}}
  if (url.includes('{{') && url.includes('}}')) {
    Object.keys(input).forEach(key => {
      url = url.replace(`{{${key}}}`, input[key]);
    });
  }
  
  const headers = typeof config.headers === 'string' ? JSON.parse(config.headers || '{}') : (config.headers || {});
  
  if (config.contentType) {
    headers['Content-Type'] = config.contentType;
  }

  const options: RequestInit = {
    method: config.method || 'GET',
    headers,
  };

  if (config.method !== 'GET' && config.body) {
    let bodyStr = config.body;
    // Template body
    if (bodyStr.includes('{{') && bodyStr.includes('}}')) {
      Object.keys(input).forEach(key => {
        bodyStr = bodyStr.replace(`{{${key}}}`, input[key]);
      });
    }
    options.body = bodyStr;
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
    }

    return { status: response.status, data };
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
}
