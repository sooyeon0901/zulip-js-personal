
 /* eslint-disable */
const { async } = require('@babel/runtime/helpers/regeneratorRuntime');
const zulip = require('../lib');

/*
* 테스트 미완료 : getMatchNarrow(), deleteAlertWords(), uploadFile(해결)
*/
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
  /* [ 나의 구독(공개/비공개된) 전체 스트림 조회 ]
  *   @params : 
  *   @ex) getStreams()
  */
  async getStreams() {
    const z = await this.z;
    return z.streams.subscriptions.retrieve();    
  }

  /* [ 전체 스트림 조회 ]
  *   @params : 
  *   비공개방 + 해당 유저가 존재O == 조회O
  *   비공개방 + 해당 유저가 존재X == 조회X
  *   (admin이어도 동일하게 적용됨)
  *   @ex) removeStreamSubscription("군고구마방-공개")
  */
  async getAllStreams(){
    const z = await this.z;
    return await z.streams.retrieve();
  }
  
  /* [ 스트림 id로 각 스트림 정보 조회 ]
  *   @params : json 형식 {"stream_id": 39}
  *   @ex) getStreamById({"stream_id": 39})
  */
  async getStreamById(stream_id){
    const z = await this.z;
    const param = {
      stream_id: stream_id
    }
    return z.streams.getStreamById(param);
  }
  
  /* [ 스트림명으로 해당 스트림의 ID 조회 ]
  *   @params : stream_name
  *   @ex) getOneStreamId("단체1-공개")
  */
  async getOneStreamId(stream_name){
    const z = await this.z;
    return z.streams.getStreamId(stream_name);
  }

  /* [ 유저의 스트림 구독 상태 조회 ] (관리자)
  *   @params : user_id, stream_id
  *   @ex) getUsersStreams(22, 42)
  *   @result : { is_subscribed: true }
  */
  async getUsersStreams(user_id, stream_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      stream_id: stream_id
    };
    return z.streams.subscriptions.status(params);    
  }

  /* [ 해당 스트림을 구독하는 구독자들 id 조회 ]
  *   @params : stream_id
  *   @ex) getAllSubscribers(39)
  *   @result : { result: 'success', msg: '', subscribers: [ 30, 29, 22 ] }
  */
  async getAllSubscribers(stream_id) {
    const z = await this.z;
    const params = {
      stream_id: stream_id
    };
    return z.streams.subscriptions.allSubscribers(params);
  }

  /* [ 해당 스트림의 설정 변경 ] (관리자)
  *   @params : subscription_data[{ stream_id, property, value }]
  *   @ex) getAllSubscribers(39)
  */
  async setSubscriptionSetting(){
    const z = await this.z;
    const params = {
      subscription_data : [{
        stream_id: 39,
        property: "color",
        value: "#FFFFFF"
      }]
    };
    return z.users.me.subscriptions.properties(params);
  }

  /* [ 스트림 업데이트 ]
  *   @params : stream_id(required)
  *         - options : stream_post_policy, is_private ...
  *   @ex) updateStream(39) + 기타 파라미터 내부 설정
  */
  async updateStream(param){
    console.log('api js1 param==', param);
    const z = await this.z;
    const params = {
      stream_id: param.stream_id,
      description: param.description,
      new_name: param.new_name,
      is_private: param.is_private,
      stream_post_policy: param.stream_post_policy,
      message_retention_days: JSON.stringify(param.message_retention_days)
      // history_public_to_subscribers: history_public_to_subscribers, // 디폴트 사용
      // is_web_public // 웹 공개 스트림인지 여부
    }
    return z.streams.subscriptions.update(params);
  }

  /* [ 나의 새 스트림 생성(create) 및 기존 스트림 구독 ]
  *   @params : user_id, stream_name
  *             stream_name이 존재하지 않으면 새 스트림을 생성하고, 존재하는 스트림이 미구독 상태이면 구독함
  *   @ex) subscribeStream("연말모임")
  */
  async subscribeStream(param){
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify([{name: param.stream_name, description: param.description}]),
      stream_post_policy: param.stream_post_policy,
      message_retention_days: JSON.stringify(param.message_retention_days) // str, int 두 개의 타입을 모두 받을 수 있기 때문에 stringify 처리해야 동작됨
      // announce: "true", // true를 string으로 넘겨야 에러 안남, 어떤 효과인지 모르겠음. 디폴트 설정이 나을듯함
      // is_web_public: "true", // 설정을 연결해서 처리해야 할 게 많음. 보류
      // history_public_to_subscribers 옵션은 필요없을 거 같아서 테스트 안함
    };
    return z.users.me.subscriptions.add(params);
  }

  /* [ 스트림에 해당 유저 추가 ]
  *   @params : user_id, stream_name
  *             stream_name이 존재하지 않으면 새 스트림을 생성함
  *   @ex) subscribeAnotherUserStream(22, "군고구마방-공개")
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

  /* [ 나의 스트림 구독 취소 ]
  *   @params : stream_name
  *   @ex) removeStreamSubscription("군고구마방-공개")
  */
  async removeStreamSubscription(stream_name){
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify([stream_name]),
    };
    return z.users.me.subscriptions.remove(params);
  }

  /* [ 해당 유저의 스트림 구독 취소 ]
  *   @params : user_id, stream_name
  *   @ex) removeAnotherUserSubscription(23)
  */
  async removeAnotherUserSubscription(user_id, stream_name){
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify([stream_name]),
      principals: JSON.stringify([user_id]),
    };
    return z.users.me.subscriptions.remove(params);
  }

  /* [ 해당 스트림 삭제 ] (관리자?)
  *   @params : { stream_id: 44 }
  *   @ex) deleteStream({"stream_id": 44})
  */
  async deleteStream(stream_id) {
    const z = await this.z;    
    const param = {
      stream_id: stream_id
    }; 
    return z.streams.deleteById(param);
  }

  /* [ 해당 스트림에서 토픽 조회 ]
  *   @params : {"stream_id": 39}
  *   @ex) getStreamTopics({"stream_id": 39})
  */
  async getStreamTopics(stream_id){
    const z = await this.z;   
    const param = {
      stream_id: stream_id
    }; 
    return z.streams.topics.retrieve(param);
  }

  /* [ 토픽 뮤트/언뮤트 ]
  *   @params : stream(스트림명), topic(토픽명), op(add/remove)
  *   @ex) muteTopic("뮤트테스트", "뮤트토픽", "add/remove")
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

  /* [ 토픽 삭제 ]
  *   @params : stream_id, topic_name
  *   @ex) deleteTopic(39, "재밌는토픽01")
  */
  async deleteTopic(stream_id, topic_name){
    const z = await this.z;    
    const params = {
      topic_name: topic_name,
      stream_id: stream_id
    }
    return z.streams.topics.delete(params);
  }

  /* [ default stream 설정 ]
  *   @params : stream_id
  *   @ex) setDefaultStream(39) 
  */
  async setDefaultStream(stream_id){
    const z = await this.z;
    const params = {
      stream_id: stream_id,
    }
    return z.streams.defaultStream.add(params);
  }

  /* [ remove default stream 설정 ]
  *   @params : stream_id
  *   @ex) removeDefaultStream(39) 
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
  /* [ 메시지 랜더링 ]
  *   @params : msg
  *   @ex) 
  */
  async messageRender(msg) {
    const z = await this.z;
    return z.messages.render(msg);
  }

  /* [ 스트림에 메시지 보내기 ]
  *   @params : stream(스트림명), topic(토픽명), msg(보낼 메시지)
  *   @ex)  sendStreamMsg("신년모임", "stream events", "메시지가나요?")
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

  /* [ private 메시지 보내기 ]
  *   @params : userId(받는 사람 id), msg(보낼 메시지)
  *   @ex) sendPrivateMsg(23, "안녕?????하세요")
  */
  async sendPrivateMsg(userId, msg){
    const z = await this.z;
    const params = {
      to: [userId],
      type: 'private',
      content: msg
    };
    return z.messages.send(params);
  }

  /* [ 스트림에 파일 업로드 ] 브라우저에서만 가능
  *   @params : 
  *   @ex) 
  */
  async uploadFile(){
    // const z = await this.z;
    // return fs;
  }

  /* [ 메시지 정보 조회 ]
  *   @params : anchor - newest최신순, oldest오래된순, first_unread안읽고 오래된순,
  *             narrow - 범위 좁히기. 작성자, 스트림
  *             num_before, num_after, ...
  *   @ex) getMsg()
  */
  async getMsg(narrowParams, otherParams){
    console.log("narrowParams==", narrowParams);
    console.log("otherParams==", otherParams);
    const z = await this.z;
    const params = {
      anchor: otherParams.anchor,
        num_before: otherParams.num_before, // 엥커보다 작은 메시지의 개수. ex) 1 == 1개, 3 == 3개 출력
        num_after: otherParams.num_after, // 엥커보다 큰 메시지의 개수. 다른 수로 테스트해도 결과값이 다르지 않음.
        narrow: narrowParams,
        // narrow: [
        //     // {operator: "sender", operand: "zulip@cherrycorp.io"}, // 작성자 한정
        //     {operator: "stream", operand: stream_name}, // 스트림 한정
        //     {operator: "streams", operand: "public"}, // 공개 스트림 한정
        // ],
        client_gravatar: otherParams.client_gravatar, // false로 지정하면 avatar_url이 null이 아닌 값이 들어가 있음. 그 값은 작성자의 아바타, 프로필이미지.
        apply_markdown: otherParams.apply_markdown, // false인 경우, 마크다운 형식으로 출력. true인 경우 랜더링된 html형식.
        // use_first_unread_anchor: true // first_unread 와 같이 사용. 
    }
    console.log("params==", params);
    return z.messages.retrieve(params);
  }

  /* [ 메시지 수정 ]
  *   일정 시간이 지나면 수정 불가능 
  *   @params : message_id
  *   @ex) editMsg(458)
  *  다른 파라미터 옵션이 있지만 쥴립 client에서는 메시지 내용 수정만 제공하므로, 
  *  다른 옵션들을 선별하는 코드를 추가하지 않음.
  */
  async editMsg(message_id, content){
    const z = await this.z;
    const params = {
      message_id: message_id,
      content: content,
      // topic: param.topic, // 해당 메시지의 토픽이 변경/생성됨
      // propagate_mode: param.propagate_mode, // 테스트 실패
      // send_notification_to_old_thread: param.send_notification_to_old_thread, // 메시지가 이동됨을 이전 토픽에 알림
      // send_notification_to_new_thread: param.send_notification_to_new_thread, // 메시지가 이동함을 현재 토픽에 알림
      // stream_id: param.stream_id // 해당 메시지의 스트림 변경. content 와 동시에 사용 불가능
    }
    return z.messages.update(params);
  }
  /* [ 메시지 삭제 ]
  *   @params : message_id
  *   @ex) deleteMsg(458)
  */
  async deleteMsg(message_id){
    const z = await this.z;
    const params = {
      message_id: message_id,
    }
    // 둘 다 가능한 형식
    // const params = {
    //   message_id,
    // }
    return z.messages.deleteById(params)
  }

  /* [ 이모지 업로드 ]
  *   @params : 
  *   @ex) 
  *   https://zulip.com/api/upload-custom-emoji
  */
   async setEmoji(){
    const z = await this.z;
    let emoji_name = "dog";
    const params = {
      emoji_name: emoji_name,
    }
    return z.emojis.set(params);
  }

  /* [ 이모지 조회 ]
  *   @params : 
  *   @ex) 
  *   https://zulip.com/api/get-custom-profile-fields
  */
  async getEmoji(){
    const z = await this.z;
    return z.emojis.retrieve();
  }

  /* [ 메시지에 이모지 추가 ]
  *   @params : message_id, emoji_name
  *   @ex) addEmojiReaction(470, "octopus")
  * {
      type: 'reaction',
      op: 'remove',
      user_id: 22,
      user: { user_id: 22, email: 'zulip@cherrycorp.io', full_name: 'goguma' },
      message_id: 470,
      emoji_name: 'octopus',
      emoji_code: '1f419',
      reaction_type: 'unicode_emoji',
      id: 0
      }
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

  /* [ 메시지에 이모지 삭제 ]
  *   @params : message_id, emoji_name
  *   @ex) removeEmojiReaction(470, "octopus")
  * */
  async removeEmojiReaction(message_id, emoji_name){
    const z = await this.z;
    const params = {
      message_id: message_id,
      emoji_name: emoji_name,
      // emoji_code: emoji_code, 
      // reaction_type: 'unicode_emoji', 
    }
    return z.messages.emoji.remove(params);
  }

  /* [ 단일 메시지 조회 ]
  *   @params : message_id
  *   @ex) getSingleMsg(470)
  */
  async getSingleMsg(message_id){
    const z = await this.z;
    const params = {
      message_id: message_id,
      apply_markdown: false, // 읽기 편한 방식. raw Markdown-format
    }
    return z.messages.getById(params);
  }

  /* [ narrow 기준이 메시지와 일치하는지 확인 ] (TODO)
  *   @params : message_id
  *   @ex) getMatchNarrow([469, 470], "신년모임")
  */
  async getMatchNarrow(message_id){
    const z = await this.z;
    const params = {
      msg_ids: message_id, // List [469, 470]. 이슈 : Argument "msg_ids" is not valid JSON.
      narrow: [{operator: "streams", operand: "신년모임"}],
    }
    console.log('params==', params);
    return z.messages.narrow.match(params);
  }

  /* [ 메시지 수정 내역 조회 ] 
  *   @params : message_id
  *   @ex) getEditHistory(471)
  */
   async getEditHistory(message_id){
    const z = await this.z;
    const params = {
      message_id: message_id
    }
    return z.messages.getHistoryById(params);
   }

  /* [ 플래그 업데이트 ] 
  *   @params : message_ids
  *   @ex) updateFlag([471, 472])
  *   @result :  { result: 'success', msg: '', messages: [ 471, 472 ] }
  *     starred 테스트 완료. mentioned 외 테스트 미완료
  */
  async updateFlag(message_ids){
    const z = await this.z;
    const params = {
      messages: message_ids,
      flag: "starred",
    }
    return z.messages.flags.add(params);
  }

  /* [ 플래그 삭제 ] 
  *   @params : message_ids
  *   @ex) removeFlag([471, 472])
  */
  async removeFlag(message_ids){
    const z = await this.z;
    const params = {
      messages: message_ids,
      flag: "starred",
    }
    return z.messages.flags.remove(params);
  }

  /* [ 모든 글 읽음 상태로 전환 ] 이슈: 안됨
  *   @params : 없음
  *   @ex) markAllMsgAsRead()
  */
  async markAllMsgAsRead(){
    const z = await this.z;
    return z.messages.read.readAll();
  }

  /* [ 스트림 글 읽음 상태로 전환 ] 
  *   @params : stream_id
  *   @ex) markStreamMsgAsRead(48)
  */
  async markStreamMsgAsRead(stream_id){
    const z = await this.z;
    const params = {
      stream_id: stream_id
    }
    return z.messages.read.streamAll(params);
  }

  /* [ 토픽 글 읽음 상태로 전환 ] 
  *   @params : stream_id, topic_name
  *   @ex) markTopicMsgAsRead(48, "stream events")
  */
  async markTopicMsgAsRead(stream_id, topic_name){
    const z = await this.z;
    const params = {
      stream_id: stream_id,
      topic_name: topic_name 
    }
    return z.messages.read.topicAll(params);
  }

  /* [ 메시지 읽음 확인 ] 
  *   @params : message_id
  *   @ex) getMsgReceipts({message_id: 479}) || getMsgReceipts(479)
  *   @result : { result: 'success', msg: '', user_ids: [] }
  *           결과는 리턴되는데 읽음 id 값이 안 뜸.
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
  /* [ 전체 유저 조회 ]
  *   @params : (client_gravatar)
  *   @ex) getAllUsers()
  */
  async getAllUsers() {
    const z = await this.z;
    const params = {
      client_gravatar: false // false로 설정시 avatar_url이 null이 아님.
    }
    return z.users.retrieve(params);
  }

  /* [ 내 정보 조회 ]
  *   @params : 
  *   @ex) getOwnUser()
  */
  async getOwnUser() {
    const z = await this.z;
    return z.users.me.getProfile();
  }

  /* [ 유저 id로 한 명 조회 ]
  *   @params : user_id
  *   @ex) getAUserById(23)
  */
  async getAUserById(user_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      client_gravatar: false
    }
    return z.users.other.getUserById(params);
  }

  /* [ 유저 email로 한 명 조회 ]
  *   @params : email
  *   @ex) getAUserByEmail("test002@cherrycorp.io")
  */
  async getAUserByEmail(email) {
    const z = await this.z;
    const params = {
      email: email,
      client_gravatar: false
    }
    return z.users.other.getUserByEmail(params);
  }

  /* [ 유저 정보 업데이트 ]
  *   @params : user_id
  *   @ex) updateUser(29)
  *   administrator만 사용 가능한 기능
  */
  async updateUser(user_id) {
    const z = await this.z;
    const params = {
      user_id : user_id,
      // role: 200, // 역할 update
      full_name: "새우깡" // 이름 update 
    }
    return z.users.update(params);
  }

  /* [ 내 상태 업데이트 ]
  *   @params : 
  *   @ex) updateMyStatus()
  */
  async updateMyStatus() {
    const z = await this.z;
    const params = {
      status_text: "on vacation2", // 프로필 하단에 글씨가 써짐
      // away: false, // 이 파라미터를 추가하면 에러가 남
      emoji_name: "tree", // 닉네임 옆에 이모지 추가됨
      // emoji_code: "1f697", // 이모지 관련
      // reaction_type: "unicode_emoji", // 닉이모지 관련
    }
    return z.users.me.status(params);
  }

  /* [ 유저 생성 ]
  *   @params : email, password, full_name
  *   @ex) updateUser(29)
  *   administrator만 사용 가능한 기능
  */
  async createUser() {
    const z = await this.z;
    const params = {
      email: "test005@cherrycorp.io",
      password: "e4net123",
      full_name: "New User",
    }
    return z.users.create(params);
  }

  /* [ 유저 활성화 ]
  *   @params : user_id
  *   @ex) deactivateUser(32)
  *   administrator만 사용 가능한 기능
  */
  async reactivateUser(user_id) {
    const z = await this.z;
    const params = {
      user_id: user_id
    }
    return z.users.other.reactivate(params);
  }

  /* [ 유저 비활성화 ]
  *   @params : user_id, (deactivation_notification_comment : 비활성화 알림 여부)
  *   @ex) deactivateUser(32)
  *   administrator만 사용 가능한 기능
  */
  async deactivateUser(user_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      // deactivation_notification_comment: "Farewell!\n" // 확인가능한 결과 없음
    }
    return z.users.other.deactivate(params);
  }

  /* [ 타이핑("입력중") 알림 ]
  *   @params : op(start/stop), to(private==user_ids/stream_id)
  *   @ex) getTypingStatus()
  *   "to"에 입력하지 않은 다른 사용자들도 서로 dm일 때는 작성중이 뜸.
  *   stream 에서 입력중이 뜨지 않음.
  */
  async getTypingStatus() {
    const z = await this.z;
    const params = {
      op: "start",
      to: [22, 23],
    }
    return z.users.typing(params);
  }

  /* [ 접속중 조회 ]
  *   @params : user_id || user_email
  *   @ex) getUserPresence(31)
  *   @result : offline/active
  */
  async getUserPresence(user_id) {
    const z = await this.z;
    const params = {
      user_id_or_email: user_id
    }
    return z.users.other.presence(params);
  }

  /* [ 조직 내 전체 접속자 조회 ]
  *   @params : 
  *   @ex) getAllUserPresence()
  */
  async getAllUserPresence() {
    const z = await this.z;
    return z.users.other.allPresence();
  }
  
  /* [ 전체 첨부파일 조회 ]
  *   @params : 
  *   @ex) getAttachments()
  */
  async getAttachments() {
    const z = await this.z;
    return z.users.attachments.retrieve();
  }

  /* [ 첨부파일 삭제 ]
  *   @params : attachment_id
  *   @ex) deleteAttachment(32)
  *    삭제 실행되지만 화면상으로는 완벽하게 사라지지 않음
  */
  async deleteAttachment(attachment_id) {
    const z = await this.z;
    const params = {
      attachment_id: attachment_id
    }
    return z.users.attachments.delete(params);
  }

  /* [ 환경 설정 ] noti && display 관련 세팅
  *   @params : optional params가 아주 많고 다양함.
  *   @ex) updateSettings()
  */
  async updateSettings() {
    const z = await this.z;
    const params = {
      // emojiset: "google",
      // full_name: "관리자예용",
      color_scheme: 2,
      // enable_offline_push_notifications: true,
      // enable_online_push_notifications: true,
      // enable_stream_email_notifications: false,
    }
    return z.users.settings.retrieve(params);
  }

  /* [ 전체 그룹 조회 ] 
  *   @params : 
  *   @ex) getUserGroups()
  */
  async getUserGroups(){
    const z = await this.z;
    return z.users.group.retrieve();
  }

  /* [ 그룹 생성 ] 
  *   @params : name(그룹명), description(설명), members(멤버)
  *   @ex) createUserGroup("HR", "인사팀", [23, 22, 31])
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

  /* [ 그룹 업데이트 ] 
  *   @params : user_group_id, name(새 이름), description(새 설명)
  *   @ex) updateUserGroup(59, "HR2", "인사2팀")
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

  /* [ 그룹 삭제 ] 
  *   @params : user_group_id
  *   @ex) deleteUserGroup(59)
  */
  async deleteUserGroup(user_group_id){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
    }
    return z.users.group.delete(params);
  }

  /* [ 그룹 유저 추가/삭제 ] 
  *   @params : user_group_id
  *   @ex) updateUserGroupMembers(58)
  */
  async updateUserGroupMembers(user_group_id){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
      delete: [22],
      add: [29,27]
    }
    return z.users.group.updateMembers(params);
  }

  /* [ 그룹 유저 상태 조회 ] 
  *   @params : user_group_id, user_id
  *   @ex) getUserGroupMemberStatus(58, 23)
  *   @result : { result: 'success', msg: '', is_user_group_member: true }
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

  /* [ 그룹 id로 유저 목록 조회 ] 
  *   @params : user_group_id
  *   @ex) getUserGroupById(58)
  *   @result : { result: 'success', msg: '', members: [ 23, 31, 29, 27 ] }
  */
  async getUserGroupById(user_group_id){
    const z = await this.z;
    const params = {
      user_group_id: user_group_id,
      // direct_member_only : direct_member_only 
    }
    return z.users.group.getUserGroupById(params);
  }

  /* [ 사용자 음소거 ] 
  *   @params : muted_user_id
  *   @ex) muteAUser(23)
  *   @ 음소거된 사용자가 보낸 모든 메시지 읽음 표시, 푸시 알림 지워짐, dm도 안 옴...
  */
  async muteAUser(muted_user_id){
    const z = await this.z;
    const params = {
      muted_user_id: muted_user_id,
    }
    return z.users.other.muted(params);
  }

  /* [ 사용자 음소거 해제 ] 
  *   @params : muted_user_id
  *   @ex) unmuteAUser(23)
  */
  async unmuteAUser(muted_user_id){
    const z = await this.z;
    const params = {
      muted_user_id: muted_user_id,
    }
    return z.users.other.unmuted(params);
  }

  /* [ 경고 단어 조회 ] 
  *   @params : 
  *   @ex) getAllAlertWords()
  */
  async getAllAlertWords(){
    const z = await this.z;
    return z.users.me.alertWords.retrieve();
  }

  /* [ 경고 단어 추가 ] 
  *   @params : alert_words
  *   @ex) addAlertWords(["foo", "bar"])
  */
  async addAlertWords(alertWords){
    console.log('test!!!');
    const z = await this.z;
    const params = {
      alert_words: alertWords,
    }
    return z.users.me.alertWords.add(params);
  }

  /* [ 경고 단어 제거 ] (TODO)
  *   @params : alert_words
  *   @ex) 
  *   ! 이슈 : Argument "alert_words" is not valid JSON
  */
  async deleteAlertWords(all_alert_words){
    const z = await this.z;
    // const a = new CZulip();

    // await a.getAllAlertWords().then((res) => {
    //   // const all_alert_words =
    //   console.log('삭제 안 파라미터 ', res);
    // });
    console.log('all_alert_words==', all_alert_words.alert_words[0]);
   
    const params = {
      alert_words: all_alert_words.alert_words[0],
    }
    console.log('params==', params);
    return z.users.me.alertWords.delete(params);
  }

}



// eslint-disable-next-line no-unused-vars
function localTest() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  // const cz = new CZulip("zulip@cherrycorp.io","YFeqVpDmkco4tXRtdnJezpObp3XZ9fJT","https://ai.e4net.net")
  const cz = new CZulip("suyeun1215@naver.com", "aR4WwdKS28O34SJsSOGNZQAGXeRlLfL0", "https://ai.e4net.net")
  
  // function handleEvent(event) {
  //   console.log(event);
  // }
  // cz.callOnEachMessage(handleEvent);
  // sleep(100).then((v)=>{console.log(v)});
  // cz.getStreams().then((data) =>{console.log(data);});
  // cz.getZulip().then((data) => {console.log(data);});
  // zulip.streams.subscriptions.retrieve().then((data) =>{console.log(data)});});
  // cz.getOneStreamId("단체1-공개").then((res) => {console.log(res);}); // 방 1개의 ID
  // cz.getAllStreams().then((res) => {console.log(res);}); // 전체 방 ID 
  // cz.sendPrivateMsg(22, "날씨가 너무 추워요").then((res) => {console.log(res);}); // 개인메시지 보내기
  
  // let params = {
  //   stream_name: "테스트생성9", 
  //   description: "테스트 설명생성4", 
  //   stream_post_policy: 1, 
  //   message_retention_days: 30
  // }
  // cz.subscribeStream(params).then((res) => {console.log(res);}); // 새 스트림 생성 및 구독 

  // let params = {
  //   stream_id: 17,
  //   description: "제너럴 수정테슽츠",
  //   new_name: "general23",
  //   is_private: false, //false ==공개방 설정
  //   stream_post_policy: 1,
  //   message_retention_days: 365
  // }
  // cz.updateStream(params).then((res) => {console.log(res);});
  
  
  // cz.subscribeAnotherUserStream(22, "군고구마방-공개").then((res) => {console.log(res);}); // 새 스트림 생성 및 구독 
  // cz.removeStreamSubscription("군고구마방-공개").then((res) => {console.log(res);})
  // cz.removeAnotherUserSubscription(22, "군고구마방-공개").then((res) => {console.log(res);});
  // cz.getUsersStreams(22, 42).then((res) => {console.log(res);});
  // cz.getAllSubscribers(39).then((res) => {console.log(res);}); // stream_id : 39

  // const testArr = []
  // testArr.push({"stream_id": 39, "property": "color", "value": "#FFC0CB"});
  // testArr.push({"stream_id": 39, "property": "pin_to_top", "value": true});
  // cz.setSubscriptionSetting().then((res) => {console.log(res);});
  // cz.getStreamById(39).then((res) => {console.log(res);});
  // cz.deleteStream(220).then((res) => {console.log(res);});
  // cz.getStreamTopics(39).then((res) => {console.log(res);});
  // cz.muteUnmuteTopic("뮤트테스트", "뮤트토픽", "add").then((res) => {console.log(res);});
  // cz.deleteTopic(39, "삭제").then((res) => {console.log(res);});
  // cz.setDefaultStream(39).then((res) => {console.log(res);});
  // cz.removeDefaultStream(39).then((res) => {console.log(res);});

  // cz.sendStreamMsg("신년모임", "stream events", "wssssgwgwgw").then((res) => {console.log(res);});
  // cz.sendPrivateMsg(23, "안녕?????하세요").then((res) => {console.log(res);});
  // cz.uploadFile().then((res) => {console.log(res);});
  // cz.getMsg("단체1-공개").then((res) => {console.log(res);});
  // cz.editMsg({message_id:1456, content:"수정1", topic:null, propagate_mode:null, 
  // send_notification_to_old_thread:null, send_notification_to_new_thread:null, stream_id:null}).then((res) => {console.log(res);});

  // let message_id;
  // let content;
  // let topic;
  // let propagate_mode;
  // let send_notification_to_old_thread;
  // let send_notification_to_new_thread;
  // let stream_id;

  // cz.deleteMsg(457).then((res) => {console.log(res);});
  // cz.addEmojiReaction(470, "octopus").then((res) => {console.log(res);});
  // cz.removeEmojiReaction(470, "octopus").then((res) => {console.log(res);});
  // cz.getSingleMsg(470).then((res) => {console.log(res);});
  // cz.getMatchNarrow([469, 470], "신년모임").then((res) => {console.log(res);});
  // cz.getEditHistory(471).then((res) => {console.log(res);});
  // cz.updateFlag([471, 472]).then((res) => {console.log(res);});
  // cz.removeFlag([471, 472]).then((res) => {console.log(res);});
  // cz.markAllMsgAsRead().then((res) => {console.log(res);});
  // cz.markStreamMsgAsRead(48).then((res) => {console.log(res);});
  // cz.markTopicMsgAsRead(48, "stream events").then((res) => {console.log(res);});
  // cz.getMsgReceipts(479).then((res) => {console.log(res);});

  
  // cz.getAllUsers().then((res) => {console.log(res);});
  cz.getOwnUser().then((res) => {console.log(res);});
  // cz.getAUserById(23).then((res) => {console.log(res);});
  // cz.getAUserByEmail("test002@cherrycorp.io").then((res) => {console.log(res);});
  // cz.updateUser(29).then((res) => {console.log(res);});
  // cz.updateMyStatus().then((res) => {console.log(res);});
  // cz.createUser().then((res) => {console.log(res);});
  // cz.deactivateUser(32).then((res) => {console.log(res);});
  // cz.reactivateUser(32).then((res) => {console.log(res);});
  // cz.getTypingStatus().then((res) => {console.log(res);});
  // cz.getUserPresence(31).then((res) => {console.log(res);});
  // cz.getAllUserPresence().then((res) => {console.log(res);});
  // cz.getAttachments().then((res) => {console.log(res);});
  // cz.deleteAttachment(32).then((res) => {console.log(res);});
  // cz.updateSettings().then((res) => {console.log(res);});
  // cz.getUserGroups().then((res) => {console.log(res);});
  // cz.createUserGroup("HR", "인사팀", [23, 22, 31]).then((res) => {console.log(res);});
  // cz.updateUserGroup(59, "HR2", "인사2팀").then((res) => {console.log(res);});
  // cz.deleteUserGroup(59).then((res) => {console.log(res);});
  // cz.updateUserGroupMembers(58).then((res) => {console.log(res);});
  // cz.getUserGroupMemberStatus(58, 23).then((res) => {console.log(res);});
  // cz.getUserGroupById(58).then((res) => {console.log(res);});
  // cz.muteAUser(23).then((res) => {console.log(res);});
  // cz.unmuteAUser(23).then((res) => {console.log(res);});
  // cz.getAllAlertWords().then((res) => {console.log(res);});
  // cz.addAlertWords(["멍청이5"]).then((res) => {console.log(res);});

  // cz.deleteAlertWords(["바보"]).then((res) => {console.log(res);});
  // cz.deleteAlertWords({
  //   "alert_words": [
  //   'foo',     'bar',
  //   '멍청이',  '바보',
  //   '멍청이2', '멍청이3',
  //   '멍청이4', '멍청이5'
  // ]
  // }).then((res) => {console.log(res);});
  // cz.getEmoji().then((res) => {console.log(res);});
  // cz.getPrivMsg().then((res) => {console.log(res);});
}

localTest();

module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
};