 /* eslint-disable */
const api = require('../api');

function users(config) {
  return {
    retrieve: (params) => {
      const url = `${config.apiURL}/users`;
      return api(url, config, 'GET', params);
    },
    create: (params) => {
      const url = `${config.apiURL}/users`;
      return api(url, config, 'POST', params);
    },
    me: {
      pointer: {
        retrieve: (params) => {
          const url = `${config.apiURL}/users/me/pointer`;
          return api(url, config, 'GET', params);
        },
        update: (id) => {
          const url = `${config.apiURL}/users/me/pointer`;
          return api(url, config, 'POST', { pointer: id });
        },
      },
      getProfile: () => {
        const url = `${config.apiURL}/users/me`;
        return api(url, config, 'GET');
      },
      subscriptions: {
        add: (params) => { // 나의 새 스트림 생성(create) 및 기존 스트림 구독
          const url = `${config.apiURL}/users/me/subscriptions`;
          return api(url, config, 'POST', params);
        },
        remove: (params) => { // 나의 스트림 구독 취소
          const url = `${config.apiURL}/users/me/subscriptions`;
          return api(url, config, 'DELETE', params);
        },
        properties: (params) => { // 스트림의 설정 변경
          const url = `${config.apiURL}/users/me/subscriptions/properties`;
          return api(url, config, 'POST', params);
        },
      },
      alertWords: {
        retrieve: (params) => {
          const url = `${config.apiURL}/users/me/alert_words`;
          return api(url, config, 'GET', params);
        },
      },
    },
  };
}

module.exports = users;
