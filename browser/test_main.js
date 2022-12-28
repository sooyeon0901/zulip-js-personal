
 /* eslint-disable */
const { async } = require('@babel/runtime/helpers/regeneratorRuntime');
const zulip = require('../lib');

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
    return z.streams.getStreamById(stream_id);
  }
  
  /* [ 스트림명으로 해당 스트림의 ID 조회 ]
  *   @params : stream_name
  *   @ex) getOneStreamId("단체1-공개")
  */
  async getOneStreamId(stream_name){
    const z = await this.z;
    return z.streams.getStreamId(stream_name);
  }

  /* [ 유저의 스트림 구독 상태 조회 ]
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

  /* [ 해당 스트림의 설정 변경 ]
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
  async updateStream(stream_id){
    const z = await this.z;
    const params = {
      stream_id: stream_id,
      stream_post_policy: 2,
      is_private: true,
    }
    return z.streams.subscriptions.update(params);
  }

  /* [ 나의 새 스트림 생성(create) 및 기존 스트림 구독 ]
  *   @params : user_id, stream_name
  *             stream_name이 존재하지 않으면 새 스트림을 생성하고, 존재하는 스트림이 미구독 상태이면 구독함
  *   @ex) subscribeStream("연말모임")
  */
  async subscribeStream(stream_name){
    const z = await this.z;
    const params = {
      subscriptions: JSON.stringify([{name: stream_name}]),
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

  /* [ 해당 스트림 삭제 ]
  *   @params : { stream_id: 44 }
  *   @ex) deleteStream({"stream_id": 44})
  */
  async deleteStream(stream_id) {
    const z = await this.z;    
    return z.streams.deleteById(stream_id);
  }

  /* [ 해당 스트림에서 토픽 조회 ]
  *   @params : {"stream_id": 39}
  *   @ex) getStreamTopics({"stream_id": 39})
  */
  async getStreamTopics(stream_id){
    const z = await this.z;    
    return z.streams.topics.retrieve(stream_id)
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
  *   @params : 
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
    await z.messages.send(params);
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
    return await z.messages.send(params);
  }

  /* [ 스트림에 파일 업로드 ] (TODO) 다시 테스트. 
  *   @params : 
  *   @ex) 
  */
  async uploadFile(stream_name, topic){
    const z = await this.z;
    const params = {
      type: "stream",
      to: stream_name,
      topic: topic,
      content: "[heart.gif](/user_uploads/8/eb/-DH9bu0uRFyHVFgY54yzthYM/heart.gif)"
    };
    return z.messages.file.upload(params);
  }

  /* [ 메시지 정보 조회 ]
  *   @params : anchor - newest최신순, oldest오래된순, first_unread안읽고 오래된순,
  *             narrow - 범위 좁히기. 작성자, 스트림
  *             num_before, num_after, ...
  *   @ex) getMsg()
  */
  async getMsg(){
    const z = await this.z;
    const params = {
      anchor: "newest",
        num_before: 3, // 엥커보다 작은 메시지의 개수. ex) 1 == 1개, 3 == 3개 출력
        num_after: 0, // 엥커보다 큰 메시지의 개수. 다른 수로 테스트해도 결과값이 다르지 않음.
        narrow: [
            // {operator: "sender", operand: "zulip@cherrycorp.io"}, // 작성자 한정
            // {operator: "stream", operand: "뮤트테스트"}, // 스트림 한정
            {operator: "streams", operand: "public"}, // 공개 스트림 한정
        ],
        client_gravatar: false, // false로 지정하면 avatar_url이 null이 아닌 값이 들어가 있음. 그 값은 작성자의 아바타, 프로필이미지.
        apply_markdown: false, // false인 경우, 마크다운 형식으로 출력. true인 경우 랜더링된 html형식.
        // use_first_unread_anchor: true // first_unread 와 같이 사용. 
      }
    return z.messages.retrieve(params);
  }
  /* [ 메시지 수정 ]
  *   일정 시간이 지나면 수정 불가능 
  *   @params : message_id
  *   @ex) editMsg(458)
  */
  async editMsg(message_id){
    const z = await this.z;
    const params = {
      message_id,
      // content: "메시지의 스트림을 변경",
      // topic: "토픽변경3", // 해당 메시지의 토픽이 변경/생성됨
      // propagate_mode: "change_later", // 테스트 실패
      // send_notification_to_old_thread: true, // 메시지가 이동됨을 이전 토픽에 알림
      // send_notification_to_new_thread: true, // 메시지가 이동함을 현재 토픽에 알림
      stream_id: 39 // 해당 메시지의 스트림 변경. content 와 동시에 사용 불가능
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

}



// eslint-disable-next-line no-unused-vars
function localTest() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  const cz = new CZulip("zulip@cherrycorp.io","YFeqVpDmkco4tXRtdnJezpObp3XZ9fJT","https://ai.e4net.net")
  
  function handleEvent(event) {
    console.log(event);
  }
  cz.callOnEachMessage(handleEvent);
  // sleep(100).then((v)=>{console.log(v)});
  // cz.getStreams().then((data) =>{console.log(data);});
  // cz.getZulip().then((zulip) => {
  // zulip.streams.subscriptions.retrieve().then((data) =>{console.log(data)});});
  // cz.getOneStreamId("단체1-공개").then((res) => {console.log(res);}); // 방 1개의 ID
  // cz.getAllStreams().then((res) => {console.log(res);}); // 전체 방 ID 
  // cz.sendPrivateMsg(23, "날씨가 너무 추워요").then((res) => {console.log(res);}); // 개인메시지 보내기
  // cz.subscribeStream("신년모임").then((res) => {console.log(res);}); // 새 스트림 생성 및 구독 
  // cz.subscribeAnotherUserStream(22, "군고구마방-공개").then((res) => {console.log(res);}); // 새 스트림 생성 및 구독 
  // cz.removeStreamSubscription("군고구마방-공개").then((res) => {console.log(res);})
  // cz.removeAnotherUserSubscription(22, "군고구마방-공개").then((res) => {console.log(res);});
  // cz.getUsersStreams(22, 42).then((res) => {console.log(res);});
  // cz.getAllSubscribers(39).then((res) => {console.log(res);}); // stream_id : 39

  // const testArr = []
  // testArr.push({"stream_id": 39, "property": "color", "value": "#FFC0CB"});
  // testArr.push({"stream_id": 39, "property": "pin_to_top", "value": true});
  // cz.setSubscriptionSetting().then((res) => {console.log(res);});
  // cz.getStreamById({"stream_id": 39}).then((res) => {console.log(res);});
  // cz.updateStream(47).then((res) => {console.log(res);});
  // cz.deleteStream({"stream_id": 44}).then((res) => {console.log(res);});
  // cz.getStreamTopics({"stream_id": 39}).then((res) => {console.log(res);});
  // cz.muteUnmuteTopic("뮤트테스트", "뮤트토픽", "add").then((res) => {console.log(res);});
  // cz.deleteTopic(39, "삭제").then((res) => {console.log(res);});
  // cz.setDefaultStream(39).then((res) => {console.log(res);});
  // cz.removeDefaultStream(39).then((res) => {console.log(res);});

  // cz.sendStreamMsg("신년모임", "stream events", "읽음테스트23332").then((res) => {console.log(res);});
  // cz.sendPrivateMsg(23, "안녕?????하세요").then((res) => {console.log(res);});
  // cz.uploadFile("뮤트테스트", "뮤트토픽").then((res) => {console.log(res);});
  // cz.getMsg().then((res) => {console.log(res);});
  // cz.editMsg(460).then((res) => {console.log(res);});
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
  cz.getMsgReceipts(479).then((res) => {console.log(res);});
}

localTest();

module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
};