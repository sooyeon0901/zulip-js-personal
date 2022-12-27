
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
  *   @params : 
  *   @ex)  
  */
  async sendStreamMsg(stream, topic, msg){
    const z = await this.z;
    await z.messages.send({
      to: stream,
      type: 'stream',
      subject: topic, 
      content: msg
    });
  }

  /* [ private 메시지 보내기 ]
  *   @params : 
  *   @ex) 
  */
  async sendPrivateMsg(userId, msg){
    const z = await this.z;
    await z.messages.send({
      to: userId,
      type: 'private',
      content: msg
    });
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

  // cz.getStreams().then((data) =>{
  //   console.log(data);
  // });
  // cz.getZulip().then((zulip) => {
  //   zulip.streams.subscriptions.retrieve().then((data) =>{
  //       console.log(data)});
  // });
  cz.getOneStreamId("단체1-공개").then((res) => {console.log(res);}); // 방 1개의 ID
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
}

localTest();

module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
};