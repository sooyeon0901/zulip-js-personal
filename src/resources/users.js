 /* eslint-disable */
const api = require('../api');

function users(config) {
  return {
    retrieve: (params) => { // 전체 유저 조회
      const url = `${config.apiURL}/users`;
      return api(url, config, 'GET', params);
    },
    create: (params) => { // 유저 생성
      const url = `${config.apiURL}/users`;
      return api(url, config, 'POST', params);
    },
    update: (params) => { // 유저 정보 업데이트
      const url = `${config.apiURL}/users/${params.user_id}`;
      console.log('params==', params);
      return api(url, config, 'PATCH', params);
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
      getProfile: () => { // 내 정보 조회
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
      status: (params) => { // 내 상태 업데이트
        const url = `${config.apiURL}/users/me/status`;
        return api(url, config, 'POST', params);
      },
      deactivate: (params) => { // 나 비활성화 (테스트 미완료)
        const url = `${config.apiURL}/users/me`;
        return api(url, config, 'DELETE', params);
      },
    },
    other: {
      getUserById: (params) => { // 유저 id로 한 명 조회
        const url = `${config.apiURL}/users/${params.user_id}`;
        return api(url, config, 'GET', params);
      },
      getUserByEmail: (params) => { // 유저 email로 한 명 조회
        const url = `${config.apiURL}/users/${params.email}`;
        return api(url, config, 'GET', params);
      },
      deactivate: (params) => { // 유저 비활성화
        const url = `${config.apiURL}/users/${params.user_id}`;
        return api(url, config, 'DELETE', params);
      },
      reactivate: (params) => { // 유저 활성화
        const url = `${config.apiURL}/users/${params.user_id}/reactivate`;
        return api(url, config, 'POST', params);
      },
      presence: (params) => { // 접속중 조회
        const url = `${config.apiURL}/users/${params.user_id_or_email}/presence`;
        return api(url, config, 'GET', params);
      },
      allPresence: (params) => { // 조직 내 전체 접속중 조회
        const url = `${config.apiURL}/realm/presence`;
        return api(url, config, 'GET', params);
      },
    },
    typing: (params) => { // 타이핑("입력중") 알림
      const url = `${config.apiURL}/typing`;
      return api(url, config, 'POST', params);
    },
    attachments: { // 전체 첨부파일 조회
      retrieve: (params) => {
        const url = `${config.apiURL}/attachments`;
        return api(url, config, 'GET', params);
      },
      delete: (params) => { // 첨부파일 삭제
        const url = `${config.apiURL}/attachments/${params.attachment_id}`;
        return api(url, config, 'DELETE', params);
      },
    },
    settings: { // 환경 설정
      retrieve: (params) => {
        const url = `${config.apiURL}/settings`;
        return api(url, config, 'PATCH', params);
      },
    },
    group: {
      retrieve: () => { // 전체 그룹 조회
        const url = `${config.apiURL}/user_groups`;
        return api(url, config, 'GET');
      },
      create: (params) => { // 그룹 생성
        const url = `${config.apiURL}/user_groups/create`;
        return api(url, config, 'POST', params);
      },
      update: (params) => { // 그룹 수정
        const url = `${config.apiURL}/user_groups/${params.user_group_id}`;
        return api(url, config, 'PATCH', params);
      },
      delete: (params) => { // 그룹 삭제
        const url = `${config.apiURL}/user_groups/${params.user_group_id}`;
        return api(url, config, 'DELETE', params);
      },
      updateMembers: (params) => { // 그룹 유저 추가/삭제
        const url = `${config.apiURL}/user_groups/${params.user_group_id}/members`;
        return api(url, config, 'POST', params);
      },
      status: (params) => { // 유저가 그룹에 속했는지 여부
        const url = `${config.apiURL}/user_groups/${params.user_group_id}/members/${params.user_id}`;
        return api(url, config, 'GET', params);
      },
      getUserGroupById: (params) => { // 그룹 id로 유저 목록 조회
        const url = `${config.apiURL}/user_groups/${params.user_group_id}/members`;
        return api(url, config, 'GET', params);
      },
    },
  };
}

module.exports = users;
