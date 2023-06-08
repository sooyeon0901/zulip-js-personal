 /* eslint-disable */
const helper = require('./helper');
// const https = require('https');  0104 ssl 에러 테스트 -> 효과없어서 주석처리

async function api(baseUrl, config, method, params) {
  const url = new URL(baseUrl);
  const auth = Buffer.from(`${config.username}:${config.apiKey}`).toString(
    'base64'
  );
  const authHeader = `Basic ${auth}`;
  const options = { method, headers: { Authorization: authHeader }, mode: 'cors' };
  // const httpsAgent = new https.Agent({
  //   rejectUnauthorized: false,
  // });

  /**
   * 23.06.08 수정사항 suyeoun.kim
   * - editMsg() 호출시 종종 글자수가 인코딩되어 searchParams으로 넘어가서 fetch 에러가 발생하였음
   *  이를 해결하기 위해 POST 방식과 동일하게 FormData를 사용하는 것으로 변경하니 에러가 발생하지 않음
   */
  if (method === 'POST' || method === 'PATCH') {
    options.body = new helper.FormData();
    Object.keys(params).forEach((key) => {
      let data = params[key];
      if (Array.isArray(data)) {
        data = JSON.stringify(data);
      }
      options.body.append(key, data);
      // options.agent = httpsAgent;
    });
  } else if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await helper.fetch(url.href, options);
 
  try {
    return response.json();
  } catch (e) {
    if (e instanceof SyntaxError) {
      // We probably got a non-JSON response from the server.
      // We should inform the user of the same.
      let message = 'Server Returned a non-JSON response.';
      if (response.status === 404) {
        message += ` Maybe endpoint: ${method} ${response.url.replace(
          config.apiURL,
          ''
        )} doesn't exist.`;
      } else {
        message += ' Please check the API documentation.';
      }
      const error = new Error(message);
      error.res = response;
      throw error;
    }
    throw e;
  }
}

module.exports = api;
