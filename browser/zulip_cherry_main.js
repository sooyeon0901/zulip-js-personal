
 /* eslint-disable */
const { async } = require('@babel/runtime/helpers/regeneratorRuntime');
const zulip = require('../lib');

const hashReplacements = new Map([
  ["%", "."],
  ["(", ".28"],
  [")", ".29"],
  [".", ".2E"],
]);

class CZulip {
  constructor(email, apiKey, uri) {
    this.z = zulip({username: email, apiKey, realm: uri});
  }
  async getZulip() {
    return this.z;
  }

  // eventHandler(event)
  async callOnEachMessage(eventHandler)  {
    const z = await this.z;
    z.callOnEachEvent(eventHandler, ['message']);
  }
  
  /* -------------------
  *     stream 관련 
  * -------------------- */
 /**
  *  [ 나의 구독(공개/비공개된) 전체 스트림 조회 ] **(나의)팔로잉
  */
  async getStreams() {
    const z = await this.z;
    return z.streams.subscriptions.retrieve();    
  }

 /**
  * [ 전체 스트림 조회 ] **모든 유저가 가입한 스트림 조회
  *   비공개방 + 해당 유저가 존재O == 조회O
  *   비공개방 + 해당 유저가 존재X == 조회X
  *   (admin이어도 동일하게 적용됨)
  *   @ex) removeStreamSubscription("군고구마방-공개")
  */
  async getAllStreams(){
    const z = await this.z;
    return await z.streams.retrieve();
  }
  
 /**
  * [ 스트림 id로 각 스트림 정보 조회 ]
  * @param {*} stream_id(필수), json 형식 {"stream_id": 39}
  * @ex) getStreamById({"stream_id": 39})
  */
  async getStreamById(stream_id){
    const z = await this.z;
    const param = {
      stream_id: stream_id
    }
    return z.streams.getStreamById(param);
  }
  
 /**
  * [ 스트림명으로 해당 스트림의 ID 조회 ]
  * @param {*} stream_name(필수) 
  *  @ex) getOneStreamId("단체1-공개")
  */
  async getOneStreamId(stream_name){
    const z = await this.z;
    return z.streams.getStreamId(stream_name);
  }

 /**
  * [ 유저의 스트림 구독 상태 조회 ] (관리자) 
  * @param {*} user_id(필수), stream_id(필수)
  * @param {*} stream_id 
  * @ex) getUsersStreams(22, 42)
  */
  async getUsersStreams(user_id, stream_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      stream_id: stream_id
    };
    return z.streams.subscriptions.status(params);    
  }

 /**
  *  [ 해당 스트림을 구독하는 구독자들 id 조회 ] **팔로워 조회
  * @param {*} stream_id(필수)
  * @ex) getAllSubscribers(39)
  */
  async getAllSubscribers(stream_id) {
    const z = await this.z;
    const params = {
      stream_id: stream_id
    };
    return z.streams.subscriptions.allSubscribers(params);
  }

 /**
  * [ 해당 스트림의 설정 변경 ] (관리자)
  * @param {*} param (JSON형식)
  * subscription_data (필수) = [{ stream_id, property, value }]
  * @ex) getAllSubscribers(39)
  */
  async setSubscriptionSetting(param){
    const z = await this.z;
    const params = {
      subscription_data : [param]
    };
    return z.users.me.subscriptions.properties(params);
  }

 /**
  * [ 스트림 업데이트 ] admin만 가능
  * @param {*} (JSON형식) stream_id(필수), description, new_name, is_private, stream_post_policy
  */
  async updateStream(param){
    const z = await this.z;
    const send_param = new Object();
    const key_arr = [];
    let keys = Object.keys(param);
    for (let i = 0; i < keys.length; i++) {
    	let key = keys[i];
      key_arr.push(key);
    }

    if(key_arr.includes("stream_id")){// 필수 파라미터
      send_param.stream_id = param["stream_id"];
    } 
    if(key_arr.includes("description")){
      send_param.description = param["description"];
    } 
    if(key_arr.includes("new_name")){
      send_param.new_name = param["new_name"];
    } 
    if(key_arr.includes("is_private")){
      send_param.is_private = param["is_private"];
    } 
    if(key_arr.includes("stream_post_policy")){
      send_param.stream_post_policy = param["stream_post_policy"];
    } 
    
    // message_retention_days: JSON.stringify(param.message_retention_days) // Owner일 때만 사용가능한 파라미터
    // history_public_to_subscribers: history_public_to_subscribers, // 디폴트 사용
    // is_web_public // 웹 공개 스트림인지 여부
    return z.streams.subscriptions.update(send_param);
  }

 /**
  * [ 나의 새 스트림 생성(create) 및 기존 스트림 구독 ] **팔로잉 action
  * @param {*} (JSON형식) user_id(필수), stream_name(필수), stream_post_policy(필수)
  * stream_name이 존재하지 않으면 새 스트림을 생성하고, 존재하는 스트림이 미구독 상태이면 구독함
  * @ex) subscribeStream("연말모임")
  */
  async subscribeStream(param){ 
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify([{name: param.stream_name, description: param.description}]),
      stream_post_policy: param.stream_post_policy,
      // message_retention_days의 값을 지정하여 스트림 생성하는 건 owner만 할 수 있음.
      // message_retention_days: JSON.stringify(param.message_retention_days) // str, int 두 개의 타입을 모두 받을 수 있기 때문에 stringify 처리해야 동작됨
      // announce: "true", // true를 string으로 넘겨야 에러 안남, 어떤 효과인지 모르겠음. 디폴트 설정이 나을듯함
      // is_web_public: "true", // 설정을 연결해서 처리해야 할 게 많음. 보류
      // history_public_to_subscribers 옵션은 필요없을 거 같아서 테스트 안함
    };
    return z.users.me.subscriptions.add(params);
  }

 /**
  * [ 스트림에 해당 유저 추가 ]
  * @param {*} user_id(필수), stream_name(필수)
  * stream_name이 존재하지 않으면 새 스트림을 생성함
  * @ex) subscribeAnotherUserStream(22, "군고구마방-공개")
  */
  async subscribeAnotherUserStream(user_id, stream_name){
    const z = await this.z;
    // 새 스트림/기존 스트림에 유저 추가
    const params = {
      subscriptions: JSON.stringify([{name: stream_name}]),
      principals: JSON.stringify([user_id]),
    };
    return z.users.me.subscriptions.add(params);
  }

 /**
  * [ 나의 스트림 구독 취소 ] **(나의)팔로우 취소
  * @param {*} stream_name(필수)
  * @ex) removeStreamSubscription("군고구마방-공개")
  */
  async removeStreamSubscription(stream_name){
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify([stream_name]),
    };
    return z.users.me.subscriptions.remove(params);
  }

 /**
  * [ 해당 유저의 스트림 구독 취소 ] **(유저의)팔로우 취소
  * @param {*} (JSON형식) user_id(필수), stream_name(필수)
  * @ex) removeAnotherUserSubscription("")
  */
  async removeAnotherUserSubscription(param){
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify(param.subscriptions),
      principals: JSON.stringify(param.principals), // 유저의 id or email
    };
    return z.users.me.subscriptions.remove(params);
  }

 /**
  * [ 해당 스트림 삭제 ]
  * @param {*} stream_id(필수) 
  * @ex) deleteStream({"stream_id": 44})
  */
  async deleteStream(stream_id) {
    const z = await this.z;    
    const param = {
      stream_id: stream_id
    }; 
    return z.streams.deleteById(param);
  }

 /**
  * [ 해당 스트림에서 토픽 조회 ]
  * @param {*} stream_id(필수) 
  * @ex) getStreamTopics({"stream_id": 39})
  */
  async getStreamTopics(stream_id){
    const z = await this.z;   
    const param = {
      stream_id: stream_id
    }; 
    return z.streams.topics.retrieve(param);
  }

 /**
  * [ 토픽 뮤트/언뮤트 ]
  * @param {*} stream(필수), topic(필수), op(add/remove)(필수) 
  * @ex) muteTopic("뮤트테스트", "뮤트토픽", "add/remove")
  */
  async muteUnmuteTopic(stream, topic, op){
    const z = await this.z;
    const params = {
      stream: stream,
      topic: topic,
      op: op,
    }
    return z.streams.topics.mutedTopics(params);
  }

 /**
  * [ 토픽 삭제 ]
  * @param {*} stream_id(필수), topic_name(필수)
  * @ex) deleteTopic(39, "재밌는토픽01")
  */
  async deleteTopic(stream_id, topic_name){
    const z = await this.z;    
    const params = {
      topic_name: topic_name,
      stream_id: stream_id
    }
    return z.streams.topics.delete(params);
  }

 /**
  * [ default stream 설정 ]
  * @param {*} stream_id(필수)
  * @ex) setDefaultStream(39) 
  */
  async setDefaultStream(stream_id){
    const z = await this.z;
    const params = {
      stream_id: stream_id,
    }
    return z.streams.defaultStream.add(params);
  }

 /**
  * [ remove default stream 설정 ]
  * @param {*} stream_id (필수)
  * @ex) removeDefaultStream(39) 
  */
  async removeDefaultStream(stream_id){
    const z = await this.z;
    const params = {
      stream_id: stream_id,
    }
    return z.streams.defaultStream.remove(params);
  }
  
  /* -------------------
  *     message 관련 
  * -------------------- */
 /**
  * [ 메시지 랜더링 ]
  * @param {*} msg(필수)
  * @returns 
  */
  async messageRender(msg) {
    const z = await this.z;
    return z.messages.render(msg);
  }

 /**
  * [ 스트림에 메시지 보내기 ]
  * @param {*} stream(필수), topic(필수), msg(필수)
  * @ex)  sendStreamMsg("신년모임", "stream events", "메시지가나요?")
  */
  async sendStreamMsg(stream, topic, msg){
    const z = await this.z;
    const params = {
        to: stream,
        type: 'stream',
        subject: topic, 
        content: msg
    };
    return z.messages.send(params);
  }

 /**
  * [ private 메시지 보내기 ]
  * @param {*} (JSON형식) userId(받는 사람 id), msg(보낼 메시지)
  */
  async sendPrivateMsg(param){
    const z = await this.z;
    const params = {
      to: param.userId,
      type: 'private',
      content: param.msg
    };
    return z.messages.send(params);
  }

 /**
  * [ 스트림에 파일 업로드 ] api를 따로 호출해서 사용중 (미사용)
  */
  async uploadFile(){
    const z = await this.z;
    return z.messages.file.upload;
  }

 /**
  * [ 메시지 정보 조회 ]
  * @param {*} narrowParams (JSON형식)
  * @param {*} otherParams (JSON형식)
  * https://zulip.com/api/get-messages
  */
  async getMsg(narrowParams, otherParams){
    const z = await this.z;
    const params = {
      anchor: otherParams.anchor,
        num_before: otherParams.num_before, // 엥커보다 작은 메시지의 개수. ex) 1 == 1개, 3 == 3개 출력
        num_after: otherParams.num_after, // 엥커보다 큰 메시지의 개수. 다른 수로 테스트해도 결과값이 다르지 않음.
        narrow: narrowParams,
        client_gravatar: otherParams.client_gravatar, // false로 지정하면 avatar_url이 null이 아닌 값이 들어가 있음. 그 값은 작성자의 아바타, 프로필이미지.
        apply_markdown: otherParams.apply_markdown, // false인 경우, 마크다운 형식으로 출력. true인 경우 랜더링된 html형식.
        // use_first_unread_anchor: true // first_unread 와 같이 사용. 
    }
    return z.messages.retrieve(params);
  }

 /**
  * [ 메시지  전체 조회 ]
  * @param {*} otherParams (JSON형식)
  * https://zulip.com/api/get-messages
  */
  async getMsgNoNarrow(otherParams){
    const z = await this.z;
    const params = {
      anchor: otherParams.anchor,
      num_before: otherParams.num_before, 
      num_after: otherParams.num_after, 
      client_gravatar: otherParams.client_gravatar,
      apply_markdown: otherParams.apply_markdown
    }
    return z.messages.retrieve(params);
  }

  /**
   * [ 메시지 수정 ]
   * 23.06.08 수정사항 suyeoun.kim
   * - api.js의 21 line에 PATCH도 추가
   * @param {*} param (JSON형식) message_id(필수), content, topic, propagate_mode, send_notification_to_old_thread, send_notification_to_new_thread, stream_id
   * 함께 사용하면 안되는 파라미터가 있어서 DOC 확인 / https://zulip.com/api/update-message
   */
  async editMsg(param){
    const z = await this.z;
    const send_param = new Object();
    const key_arr = [];
    let keys = Object.keys(param);
    for (let i = 0; i < keys.length; i++) {
    	let key = keys[i];
      key_arr.push(key);
    }

    if(key_arr.includes("message_id")){
      send_param.message_id = param["message_id"];
    } 
    if(key_arr.includes("content")){
      send_param.content = param["content"];
    } 
    if(key_arr.includes("topic")){
      send_param.topic = param["topic"];
    } 
    if(key_arr.includes("propagate_mode")){
      send_param.propagate_mode = param["propagate_mode"];
    } 
    if(key_arr.includes("send_notification_to_old_thread")){
      send_param.send_notification_to_old_thread = param["send_notification_to_old_thread"];
    } 
    if(key_arr.includes("send_notification_to_new_thread")){
      send_param.send_notification_to_new_thread = param["send_notification_to_new_thread"];
    } 
    if(key_arr.includes("stream_id")){
      send_param.stream_id = param["stream_id"];
    }
    return z.messages.update(send_param);
  }

 /**
  *  [ 메시지 삭제 ]
  * @param {*} message_id(필수)
  */
  async deleteMsg(message_id){
    const z = await this.z;
    const params = {
      message_id: message_id,
    }
    return z.messages.deleteById(params)
  }

 /**
  * [ 이모지 조회 ]
  * https://zulip.com/api/get-custom-profile-fields
  */
  async getEmoji(){
    const z = await this.z;
    return z.emojis.retrieve();
  }

 /**
  * [ 메시지에 이모지 추가 ]
  * @param {*} message_id(필수), emoji_name(필수)
  */
  async addEmojiReaction(message_id, emoji_name){
    const z = await this.z;
    const params = {
      message_id: message_id,
      emoji_name: emoji_name,
      // emoji_code: emoji_code, // 옵션. 에러는 안나지만 이모지가 추가 안됨.
      // reaction_type: 'unicode_emoji', // 그 외 타입 : realm_emoji, zulip_extra_emoji 
    }
    return z.messages.emoji.add(params);
  }

 /**
  * [ 메시지에 이모지 삭제 ]
  * @param {*} message_id(필수) , emoji_name(필수)
  * @ex) removeEmojiReaction(470, "octopus")
  */
  async removeEmojiReaction(message_id, emoji_name){
    const z = await this.z;
    const params = {
      message_id: message_id,
      emoji_name: emoji_name,
      // emoji_code: emoji_code, 
      reaction_type: 'realm_emoji', 
    }
    return z.messages.emoji.remove(params);
  }

 /**
  *  [ 단일 메시지 조회 ]
  * @param {*} param (JSON형식) message_id(필수), apply_markdown(필수)
  * @ex) getSingleMsg(470)
  */
  async getSingleMsg(param){
    const z = await this.z;
    const params = {
      message_id: param.message_id,
      apply_markdown: param.apply_markdown, // 읽기 편한 방식. raw Markdown-format
    }
    return z.messages.getById(params);
  }

 /**
  * [ 메시지 수정 내역 조회 ] 
  * @param {*} message_id (필수)
  * @ex) getEditHistory(471)
  */
   async getEditHistory(message_id){
    const z = await this.z;
    const params = {
      message_id: message_id
    }
    return z.messages.getHistoryById(params);
   }

 /**
  *  [ 플래그 업데이트 ] 
  * @param {*} param (JSON형식) message_ids(필수), flag(필수)
  * @ex) updateFlag([471, 472])
  */
  async updateFlag(param){
    const z = await this.z;
    const params = {
      messages: param.message_ids,
      flag: param.flag,
    }
    return z.messages.flags.add(params);
  }

 /**
  * [ 플래그 삭제 ] 
  * @param {*} param (JSON형식) message_ids(필수), flag(필수)
  * @ex) removeFlag([471, 472])
  */
  async removeFlag(param){
    const z = await this.z;
    const params = {
      messages: param.message_ids,
      flag: param.flag,
    }
    return z.messages.flags.remove(params);
  }

 /**
  * [ 모든 글 읽음 상태로 전환 ] 이슈: 안됨
  * @ex) markAllMsgAsRead()
  */
  async markAllMsgAsRead(){
    const z = await this.z;
    return z.messages.read.readAll();
  }

 /**
  * [ 스트림 글 읽음 상태로 전환 ] 
  * @param {*} stream_id (필수)
  * @ex) markStreamMsgAsRead(48)
  */
  async markStreamMsgAsRead(stream_id){
    const z = await this.z;
    const params = {
      stream_id: stream_id
    }
    return z.messages.read.streamAll(params);
  }

 /**
  * [ 토픽 글 읽음 상태로 전환 ] 
  * @param {*} stream_id(필수), topic_name(필수)
  * @ex) markTopicMsgAsRead(48, "stream events")
  */
  async markTopicMsgAsRead(stream_id, topic_name){
    const z = await this.z;
    const params = {
      stream_id: stream_id,
      topic_name: topic_name 
    }
    return z.messages.read.topicAll(params);
  }

 /**
  * [ 메시지 읽음 확인 ] 
  * @param {*} message_id (필수)
  * @ex) getMsgReceipts({message_id: 479}) || getMsgReceipts(479)
  */
  async getMsgReceipts(message_id){
    const z = await this.z;
    const params = {
      message_id: message_id,
    }
    return z.messages.read.receipts(params);
  }


  
  /* -------------------
  *     user 관련 
  * -------------------- */
 /**
  *  [ 전체 유저 조회 ]
  * @param {*} client_gravatar(필수) (default = false)
  */
  async getAllUsers(client_gravatar) {
    const z = await this.z;
    const params = {
      client_gravatar: client_gravatar // false로 설정시 avatar_url이 null이 아님.
    }
    return z.users.retrieve(params);
  }

 /**
  * [ 내 정보 조회 ]
  * @ex) getOwnUser()
  */
  async getOwnUser() {
    const z = await this.z;
    return z.users.me.getProfile();
  }

 /**
  * [ 유저 id로 한 명 조회 ]
  * @param {*} user_id (필수)
  * @ex) getAUserById(23)
  */
  async getAUserById(user_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      client_gravatar: false
    }
    return z.users.other.getUserById(params);
  }

 /**
  * [ 유저 email로 한 명 조회 ]
  * @param {*} email (필수)
  * @ex) getAUserByEmail("test002@cherrycorp.io")
  */
  async getAUserByEmail(email) {
    const z = await this.z;
    const params = {
      email: email,
      client_gravatar: false
    }
    return z.users.other.getUserByEmail(params);
  }

 /**
  * [ 유저 정보 업데이트 ]
  * @param {*} param (JSON형식) user_id(필수), role, full_name
  * @ex) updateUser(29)
  * administrator만 사용 가능한 기능
  */
  async updateUser(param) {
    const z = await this.z;
    const send_param = new Object();
    const key_arr = [];
    let keys = Object.keys(param);
    for (let i = 0; i < keys.length; i++) {
    	let key = keys[i];
      key_arr.push(key);
    }

    if(key_arr.includes("user_id")){
      send_param.user_id = param["user_id"];
    } 
    if(key_arr.includes("role")){
      send_param.role = param["role"];
    } 
    if(key_arr.includes("full_name")){
      send_param.full_name = param["full_name"];
    } 

    return z.users.update(send_param);
  }

 /**
  * [ 내 상태 업데이트 ]
  * @param {*} param(JSON형식) status_text(필수), emoji_name(필수)
  * @ex) updateMyStatus(param)
  */
  async updateMyStatus(param) {
    const z = await this.z;
    const params = {
      status_text: param.status_text, // 프로필 하단에 글씨가 써짐
      // away: false, // 이 파라미터를 추가하면 에러가 남
      emoji_name: param.emoji_name, // 닉네임 옆에 이모지 추가됨
      // emoji_code: "1f697", // 이모지 관련
      // reaction_type: "unicode_emoji", // 닉이모지 관련
    }
    return z.users.me.status(params);
  }

 /**
  * [ 유저 생성 ]
  * @param {*} param (JSON형식) email(필수), password(필수), full_name(필수)
  * administrator만 사용 가능한 기능
  */
  async createUser(param) {
    const z = await this.z;
    const params = {
      email: param.email,
      password: param.password,
      full_name: param.full_name,
    }
    return z.users.create(params);
  }

 /**
  * [ 유저 활성화 ]
  * @param {*} user_id (필수)
  * @ex) deactivateUser(32)
  * administrator만 사용 가능한 기능
  */
  async reactivateUser(user_id) {
    const z = await this.z;
    const params = {
      user_id: user_id
    }
    return z.users.other.reactivate(params);
  }

 /**
  * [ 유저 비활성화 ]
  * @param {*} user_id(필수), (deactivation_notification_comment : 비활성화 알림 여부)
  * @ex) deactivateUser(32)
  * administrator만 사용 가능한 기능
  */
  async deactivateUser(user_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      // deactivation_notification_comment: "Farewell!\n" // 확인가능한 결과 없음
    }
    return z.users.other.deactivate(params);
  }

 /**
  * [ 타이핑("입력중") 알림 ] DM일 때
  * @param {*} param(JSON형식) op(start/stop)(필수), to(private==user_ids)(필수), type = "private"이 디폴트값으로 들어감
  * @ex) getTypingStatus(param)
  * "to"에 입력하지 않은 다른 사용자들도 서로 dm일 때는 작성중이 뜸. stream 에서 입력중이 뜨지 않음.
  */
  async getTypingStatusPm(param) {
    const z = await this.z;
    const params = {
      op: param.op,
      to: param.to,
    }
    return z.users.typing(params);
  }

 /**
  * [ 타이핑("입력중") 알림 ] 스트림일 때
  * @param {*} param(JSON형식) op(start/stop)(필수), to(stream_id)(필수), topic(필수)
  * @ex) getTypingStatusStream(param)
  */
  async getTypingStatusStream(param) {
    const z = await this.z;
    const params = {
      op: param.op,
      to: param.to,
      type: "stream",
      topic: param.topic
    }
    return z.users.typing(params);
  }

 /**
  * [ 접속중 조회 ]
  * @params : user_id || user_email(택1 필수)
  * @ex) getUserPresence(31)
  */
  async getUserPresence(user_id) {
    const z = await this.z;
    const params = {
      user_id_or_email: user_id
    }
    return z.users.other.presence(params);
  }

 /**
  * [ 조직 내 전체 접속자 조회 ]
  */
  async getAllUserPresence() {
    const z = await this.z;
    return z.users.other.allPresence();
  }
  
 /**
  * [ 전체 첨부파일 조회 ]
  */
  async getAttachments() {
    const z = await this.z;
    return z.users.attachments.retrieve();
  }

 /**
  * [ 첨부파일 삭제 ]
  * @param {*} attachment_id (필수)
  * @ex) deleteAttachment(32)
  * 삭제 실행되지만 화면상으로는 완벽하게 사라지지 않음
  */
  async deleteAttachment(attachment_id) {
    const z = await this.z;
    const params = {
      attachment_id: attachment_id
    }
    return z.users.attachments.delete(params);
  }

 /**
  * [ 환경 설정 ] noti && display 관련 세팅. 
  * (TODO) 파라미터를 선택가능하도록 변경
  * @param {*} param (JSON형식) emojiset(필수), full_name, color_scheme(필수), enable_offline_push_notifications(필수), 
  *                             enable_online_push_notifications(필수), enable_stream_email_notifications(필수)
  * @ex) updateSettings(param)
  */
  async updateSettings(param) {
    const z = await this.z;
    const params = {
      // emojiset: param.emojiset,
      // full_name: param.full_name,
      color_scheme: param.color_scheme,
      // enable_offline_push_notifications: param.enable_offline_push_notifications,
      // enable_online_push_notifications: param.enable_online_push_notifications,
      // enable_stream_email_notifications: param.enable_stream_email_notifications,
    }
    return z.users.settings.retrieve(params);
  }

 /**
  * [ 전체 그룹 조회 ] 
  */
  async getUserGroups(){
    const z = await this.z;
    return z.users.group.retrieve();
  }

 /**
  * [ 그룹 생성 ] 
  * @param {*} name(필수), description(필수), members(필수)
  * @ex) createUserGroup("HR", "인사팀", [23, 22, 31])
  */
  async createUserGroup(name, description, members){
    const z = await this.z;
    const params = {
      name: name,
      description: description,
      members: members,
    }
    return z.users.group.create(params);
  }

 /**
  * [ 그룹 업데이트 ] 
  * @param {*} user_group_id(필수), name(새 이름)(필수), description(새 설명)(필수)
  * @ex) updateUserGroup(59, "HR2", "인사2팀")
  */
  async updateUserGroup(user_group_id, name, description){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
      name: name,
      description: description
    }
    return z.users.group.update(params);
  }

 /**
  * [ 그룹 삭제 ] 
  * @param {*} user_group_id (필수)
  * @ex) deleteUserGroup(59)
  */
  async deleteUserGroup(user_group_id){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
    }
    return z.users.group.delete(params);
  }

 /**
  * [ 그룹 유저 추가/삭제 ] 
  * @param {*} param(JSON형식) user_group_id(필수), delete_user_ids(필수), add_user_ids(필수)
  * @ex) updateUserGroupMembers(58)
  */
  async updateUserGroupMembers(param){
    const z = await this.z;
    const params = {
      user_group_id: param.user_group_id,
      delete: param.delete_user_ids,
      add: param.add_user_ids
    }
    return z.users.group.updateMembers(params);
  }

 /**
  *  [ 그룹 유저 상태 조회 ] 
  * @param {*} user_group_id (필수), user_id (필수)
  * @param {*} user_id 
  * @ex) getUserGroupMemberStatus(58, 23)
  */
  async getUserGroupMemberStatus(user_group_id, user_id){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
      user_id: user_id,
      // direct_member_only : direct_member_only 
    }
    return z.users.group.status(params);
  }

 /**
  * [ 그룹 id로 유저 목록 조회 ] 
  * @param {*} user_group_id (필수)
  * @ex) getUserGroupById(58)
  */
  async getUserGroupById(user_group_id){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
      // direct_member_only : direct_member_only 
    }
    return z.users.group.getUserGroupById(params);
  }

 /**
  * [ 사용자 음소거 ] 
  * @param {*} muted_user_id (필수)
  * @ex) muteAUser(23)
  * 음소거된 사용자가 보낸 모든 메시지 읽음 표시, 푸시 알림 지워짐, dm도 안 옴.
  */
  async muteAUser(muted_user_id){
    const z = await this.z;
    const params = {
      muted_user_id: muted_user_id,
    }
    return z.users.other.muted(params);
  }

 /**
  * [ 사용자 음소거 해제 ] 
  * @param {*} muted_user_id (필수)
  * @ex) unmuteAUser(23)
  */
  async unmuteAUser(muted_user_id){
    const z = await this.z;
    const params = {
      muted_user_id: muted_user_id,
    }
    return z.users.other.unmuted(params);
  }

 /**
  * [ 키워드 알림 단어 조회 ] 
  */
  async getAllAlertWords(){
    const z = await this.z;
    return z.users.me.alertWords.retrieve();
  }

 /**
  * [ 키워드 알림 단어 추가 ] 
  * @param {*} param(JSON형식) alertWords(필수)
  * @ex) addAlertWords(["foo", "bar"])
  */
  async addAlertWords(param){
    const z = await this.z;
    const params = {
      alert_words: param.alertWords,
    }
    return z.users.me.alertWords.add(params);
  }

 /**
  * [ 키워드 알림 단어 제거 ]
  * @param {*} param (JSON형식) alertWords(필수)
  * @ex) let param = { alertWords: ["멍청이2"] }
  */
  async deleteAlertWords(param){
    const z = await this.z;
    const params = {
      alert_words: JSON.stringify(param.alertWords),
    }
    return z.users.me.alertWords.delete(params);
  }



}

class Urls {
  constructor(message) {
    this.message = message;
  }
  stream_id_to_slug(stream_id, maybe_get_stream_name) {
    let name = maybe_get_stream_name || "unknown";
    name = name.replace(/ /g, "-");
    return stream_id + "-" + name;
  }
  encode_stream_id(stream_id, maybe_get_stream_name) {
    const u = new Urls();
    const slug = u.stream_id_to_slug(stream_id, maybe_get_stream_name);
    return u.encodeHashComponent(slug);
  }
  set_by_stream_topic_url(stream_id, topic, maybe_get_stream_name) {
    const u = new Urls();
    return (
        "#narrow/stream/" +
        u.encode_stream_id(stream_id, maybe_get_stream_name) +
        "/topic/" +
        u.encodeHashComponent(topic)
    );
  }
  sort_numerically(user_ids) {
    user_ids.sort((a, b) => a - b);
    return user_ids;
  }
  all_user_ids_in_pm(message) {
    const u = new Urls();
    if (message.type !== "private") {
        return undefined;
    }
    if (message.display_recipient.length === 0) {
        blueslip.error("Empty recipient list in message");
        return undefined;
    }
    let user_ids = message.display_recipient.map((recip) => recip.id);
    user_ids = u.sort_numerically(user_ids);
    return user_ids;
  }
  by_stream_topic_url(stream_id, topic, stream_name) {
    const u = new Urls();
    let maybe_get_stream_name = stream_name;
    return u.set_by_stream_topic_url(stream_id, topic, maybe_get_stream_name);
  }
  pm_perma_link(message) {
    const u = new Urls();
    const user_ids = all_user_ids_in_pm(message);
    if (!user_ids) {
        return undefined;
    }
    let suffix;
    if (user_ids.length >= 3) {
        suffix = "group";
    } else {
        suffix = "pm";
    }
    const slug = user_ids.join(",") + "-" + suffix;
    const uri = "#narrow/pm-with/" + slug;
    return uri;
  }
  encodeHashComponent(str) {
    return encodeURIComponent(str).replace(/[%().]/g, (matched) => hashReplacements.get(matched));
  }
  by_conversation_and_time_url(message) {
    const u = new Urls();
    const absolute_url =
        window.location.protocol +
        "//" +
        window.location.host +
        "/" +
        window.location.pathname.split("/")[1];
    const suffix = "/near/" + u.encodeHashComponent(message.id);
    if (message.type === "stream") {
        return absolute_url + u.by_stream_topic_url(message.stream_id, message.subject, message.display_recipient) + suffix;
    }
    return absolute_url + u.pm_perma_link(message) + suffix;
  }
}

// eslint-disable-next-line no-unused-vars
function localTest() {
  // 실행 명령어 : node zulip_cherry_main.js
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  // eslint-disable-next-line no-unused-vars
  const cz = new CZulip("1000000000000002597@dev.cworld.cherry","jHziQ89YjPSUcOsLnQSZuxB38XuylOUO", "https://dev-zulip.letscherry.io");
  // const cz = new CZulip("zulip@cherrycorp.io","H8JKDAcojlSxoGIGrSo5uqPD4cKGvYvF", "https://dev-zulip.letscherry.io");
  // cz.getUserGroups().then((m)=> {console.log(m);});
  // cz.updateUserGroup(15, "그룹테스트2", "그룹테스트 patch test").then((m)=> {console.log(m);});

  // const params = {
  //   color_scheme: 1
  // }
  // cz.updateSettings(params).then((m)=> {console.log(m);});

  // const params = {
  //   user_id: 633,
  //   role: 400
  // }
  // cz.updateUser(params).then((m)=> {console.log(m);});

  // cz.muteUnmuteTopic("bulkTest", "postmantest", "remove").then((m)=> {console.log(m);});

  // const params = {
  //   stream_id: 238,
  //   description: "fetch test"
  // }
  // cz.updateStream(params).then((m)=> {console.log(m);});
  // cz.getOneStreamId("bulkTest").then((m)=> {console.log(m);});
}

// localTest();


module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
  Urls: Urls,
};