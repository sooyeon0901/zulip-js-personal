 /* eslint-disable */
const api = require('../api');

function messages(config) {
  const baseURL = `${config.apiURL}/messages`;
  const flagsURL = `${baseURL}/flags`;
  return {
    retrieve: (initialParams) => {
      const url = `${config.apiURL}/messages`;
      const params = { ...initialParams };
      if (params.narrow) {
        params.narrow = JSON.stringify(params.narrow);
      }
      return api(url, config, 'GET', params);
    },
    send: (params) => {
      const url = `${config.apiURL}/messages`;
      return api(url, config, 'POST', params);
    },
    render: (initialParams) => { // 메시지 랜더링
      const url = `${config.apiURL}/messages/render`;
      let params = { ...initialParams };
      if (typeof initialParams === 'string') {
        params = {
          content: initialParams,
        };
      }
      return api(url, config, 'POST', params);
    },
    update: (params) => {
      const url = `${config.apiURL}/messages/${params.message_id}`;
      return api(url, config, 'PATCH', params);
    },
    flags: {
      add: (initialParams) => {
        // params.flag can be one of 'read', 'starred', 'mentioned',
        // 'wildcard_mentioned', 'has_alert_word', 'historical',
        const params = { ...initialParams };
        params.op = 'add';
        if (params.messages) {
          params.messages = JSON.stringify(params.messages);
        }
        return api(flagsURL, config, 'POST', params);
      },
      remove: (initialParams) => {
        // params.flag can be one of 'read', 'starred', 'mentioned',
        // 'wildcard_mentioned', 'has_alert_word', 'historical',
        const params = { ...initialParams };
        params.op = 'remove';
        if (params.messages) {
          params.messages = JSON.stringify(params.messages);
        }
        return api(flagsURL, config, 'POST', params);
      },
    },
    file: {
      upload: (params) => {
        console.log('params==', params);
        const url = `${config.apiURL}/user_uploads`;
        console.log('url==', url);
        return api(url, config, 'POST', params);
      },
    },
    emoji: {
      add: (params) => {
        const url = `${config.apiURL}/messages/${params.message_id}/reactions`;
        return api(url, config, 'POST', params);
      },
      remove: (params) => {
        const url = `${config.apiURL}/messages/${params.message_id}/reactions`;
        return api(url, config, 'DELETE', params);
      },
    },
    narrow: {
      match: (params) => {
        const url = `${config.apiURL}/messages/matches_narrow`;
        console.log('params==', params);
        console.log('url==', url);
        return api(url, config, 'GET', params);
      },
    },
    getById: (params) => {
      const url = `${config.apiURL}/messages/${params.message_id}`;
      return api(url, config, 'GET', params);
    },
    getHistoryById: (params) => {
      const url = `${config.apiURL}/messages/${params.message_id}/history`;
      return api(url, config, 'GET', params);
    },
    deleteById: (params) => {
      const url = `${config.apiURL}/messages/${params.message_id}`;
      return api(url, config, 'DELETE', params);
    },
    read: {
      readAll: () => {
        const url = `${config.apiURL}/mark_all_as_read`;
        return api(url, config, 'POST');
      },
      streamAll: (params) => {
        const url = `${config.apiURL}/mark_stream_as_read`;
        return api(url, config, 'POST', params);
      },
      topicAll: (params) => {
        const url = `${config.apiURL}/mark_topic_as_read`;
        return api(url, config, 'POST', params);
      },
      receipts: (params) => {
        const url = `${config.apiURL}/messages/${params.message_id}/read_receipts`;
        console.log('url==', url);
        return api(url, config, 'GET', params);
      },
    },
  };
}

module.exports = messages;
