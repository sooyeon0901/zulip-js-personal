 /* eslint-disable */
const api = require('../api');

function streams(config) {
  return {
    retrieve: (params) => { // 전체 스트림 조회
      const url = `${config.apiURL}/streams`;
      return api(url, config, 'GET', params);
    },
    getStreamById: (params) => { // 스트림 id로 각 스트림 정보 조회
      const url = `${config.apiURL}/streams/${params.stream_id}`;
      return api(url, config, 'GET', params);
    },
    getStreamId: (initialParams) => { // 스트림명으로 해당 스트림의 ID 조회
      const url = `${config.apiURL}/get_stream_id`;
      let params = { ...initialParams };
      if (typeof initialParams === 'string') {
        params = {
          stream: initialParams,
        };
      }
      return api(url, config, 'GET', params);
    },
    subscriptions: {
      retrieve: (params) => { // 나의 구독(공개/비공개된) 전체 스트림 조회
        const param = { ...params };
        const url = `${config.apiURL}/users/me/subscriptions`;
        return api(url, config, 'GET', params);
      },
      update: (params) => { // 스트림 업데이트
        const param = { ...params };
        const url = `${config.apiURL}/streams/${param.stream_id}`;
        return api(url, config, 'PATCH', params);
      },
      status: (params) => { // 유저의 스트림 구독 상태 조회
        const param = { ...params };
        const url = `${config.apiURL}/users/${param.user_id}/subscriptions/${param.stream_id}`;
        return api(url, config, 'GET', params);
      },
      allSubscribers: (params) => { // 해당 스트림을 구독하는 구독자들 id 조회
        const param = { ...params };
        const url = `${config.apiURL}/streams/${param.stream_id}/members`;
        return api(url, config, 'GET', params);
      },
    },
    topics: {
      retrieve: (params) => { // 해당 스트림에서 토픽 조회
        const url = `${config.apiURL}/users/me/${params.stream_id}/topics`;
        return api(url, config, 'GET');
      },
      mutedTopics: (params) => { // 토픽 뮤트/언뮤트
        const url = `${config.apiURL}/users/me/subscriptions/muted_topics`;
        return api(url, config, 'PATCH', params);
      },
      delete: (params) => { // 토픽 삭제
        const url = `${config.apiURL}/streams/${params.stream_id}/delete_topic`;
        return api(url, config, 'POST', params);
      },
    },
    deleteById: (params) => { // 해당 스트림 삭제
      const url = `${config.apiURL}/streams/${params.stream_id}`;
      return api(url, config, 'DELETE', params);
    },
    defaultStream: {
      add: (params) => { // default stream 설정
        const url = `${config.apiURL}/default_streams`;
        // params 인자 추가
        return api(url, config, 'POST', params);
      },
      remove: (params) => { // remove default stream 설정
        const url = `${config.apiURL}/default_streams`;
        // params 인자 추가
        return api(url, config, 'DELETE', params);
      }
    },
  };
}

module.exports = streams;
