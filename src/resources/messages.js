 /* eslint-disable */
const api = require('../api');

function messages(config) {
  const baseURL = `${config.apiURL}/messages`;
  const flagsURL = `${baseURL}/flags`;
  return {
    retrieve: (initialParams) => { // 메시지 정보 조회
      const url = `${config.apiURL}/messages`;
      const params = { ...initialParams };
      if (params.narrow) {
        params.narrow = JSON.stringify(params.narrow);
      }
      return api(url, config, 'GET', params);
    },
    send: (params) => { // 스트림/private에 메시지 보내기
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
    update: (params) => { // 메시지 수정
      const url = `${config.apiURL}/messages/${params.message_id}`;
      return api(url, config, 'PATCH', params);
    },
    flags: {
      add: (initialParams) => { // 플래그 업데이트
        // params.flag can be one of 'read', 'starred', 'mentioned',
        // 'wildcard_mentioned', 'has_alert_word', 'historical',
        const params = { ...initialParams };
        params.op = 'add';
        if (params.messages) {
          params.messages = JSON.stringify(params.messages);
        }
        return api(flagsURL, config, 'POST', params);
      },
      remove: (initialParams) => { // 플래그 삭제
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
      upload: (params) => { // 스트림에 파일 업로드
        console.log('params==', params);
        const url = `${config.apiURL}/user_uploads`;
        console.log('url==', url);
        return api(url, config, 'POST', params);
      },
    },
    emoji: {
      add: (params) => { // 메시지에 이모지 추가
        const url = `${config.apiURL}/messages/${params.message_id}/reactions`;
        return api(url, config, 'POST', params);
      },
      remove: (params) => { // 메시지에 이모지 삭제
        const url = `${config.apiURL}/messages/${params.message_id}/reactions`;
        return api(url, config, 'DELETE', params);
      },
    },
    narrow: {
      match: (params) => { // narrow 기준이 메시지와 일치하는지 확인
        const url = `${config.apiURL}/messages/matches_narrow`;
        console.log('params==', params);
        console.log('url==', url);
        return api(url, config, 'GET', params);
      },
    },
    getById: (params) => { // 단일 메시지 조회
      const url = `${config.apiURL}/messages/${params.message_id}`;
      return api(url, config, 'GET', params);
    },
    getHistoryById: (params) => { // 메시지 수정 내역 조회
      const url = `${config.apiURL}/messages/${params.message_id}/history`;
      return api(url, config, 'GET', params);
    },
    deleteById: (params) => { // 메시지 삭제
      const url = `${config.apiURL}/messages/${params.message_id}`;
      return api(url, config, 'DELETE', params);
    },
    read: {
      readAll: () => { // 모든 글 읽음 상태로 전환
        const url = `${config.apiURL}/mark_all_as_read`;
        return api(url, config, 'POST');
      },
      streamAll: (params) => { // 스트림 글 읽음 상태로 전환
        const url = `${config.apiURL}/mark_stream_as_read`;
        return api(url, config, 'POST', params);
      },
      topicAll: (params) => { // 토픽 글 읽음 상태로 전환
        const url = `${config.apiURL}/mark_topic_as_read`;
        return api(url, config, 'POST', params);
      },
      receipts: (params) => { // 메시지 읽음 확인
        const url = `${config.apiURL}/messages/${params.message_id}/read_receipts`;
        console.log('url==', url);
        return api(url, config, 'GET', params);
      },
    },
  };
}

module.exports = messages;
