
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
  *     message 관련 
  * -------------------- */
  
  // 메시지 랜더링
  async messageRender(msg) {
    const z = await this.z;
    return z.messages.render(msg);
  }

  // 스트림에 메시지 보내기
  async sendStreamMsg(stream, topic, msg){
    const z = await this.z;
    await z.messages.send({
      to: stream,
      type: 'stream',
      subject: topic, 
      content: msg
    });
  }

  // private 메시지 보내기 (TODO)
  async sendPrivateMsg(userId, msg){
    const z = await this.z;
    await z.messages.send({
      to: userId,
      type: 'private',
      content: msg
    });
  }

  /* -------------------
  *     stream 관련 
  * -------------------- */
  // 공개된 전체 스트림 정보 - 비공개가 안보이는지 보이는지 TODO 
  async getStreams() {
    const z = await this.z;
    return z.streams.subscriptions.retrieve();    
  }

  // 해당 유저의 해당 스트림 구독 상태값
  // is_subscribed: true
  // 1223 이거 테스트까지 작업함 
  async getUsersStreams(user_id, stream_id) {
    const z = await this.z;
    const params = {
      user_id: user_id,
      stream_id: stream_id
    };
    return z.streams.subscriptionsUsers.retrieve(params);    
  }

  // (streamName)스트림의 ID
  async getOneStreamId(streamName){
    const z = await this.z;
    return z.streams.getStreamId(streamName);
  }

  // 전체 스트림 IDs
  async getAllStreams(){
    const z = await this.z;
    return await z.streams.retrieve();
  }

  // 새 스트림 생성 및 구독
  async subscribeStream(){
    const z = await this.z;
    // name이 없는 스트림이면 새로 생성됨
    const meParams = {
      subscriptions: JSON.stringify([{name: "Denmark"}]),
    };
    return z.users.me.subscriptions.add(meParams);
  }

  // 스트림에 해당 유저 추가
  async subscribeAnotherUserStream(user_id){
    const z = await this.z;
    // 새 스트림/기존 스트림에 유저 추가
    const anotherUserParams = {
      subscriptions: JSON.stringify([{name: "Korea"}]),
      principals: JSON.stringify([user_id]),
    };
    return z.users.me.subscriptions.add(anotherUserParams);
  }

  // 스트림 구독 취소 (한번에 안되고 두번째에 성공(?))
  async removeStreamSubscription(){
    const z = await this.z;
    const meParams = {
      subscriptions: JSON.stringify(["Denmark"]),
    };
    return z.users.me.subscriptions.remove(meParams);
  }

  // 해당 유저의 스트림 구독 취소
  async removeAnotherUserSubscription(user_id){
    const z = await this.z;
    const zoeParams = {
      subscriptions: JSON.stringify(["Denmark"]),
      principals: JSON.stringify([user_id]),
    };
    return z.users.me.subscriptions.remove(zoeParams);
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
  // cz.getOneStreamId("단체1-공개").then((res) => {console.log(res);}); // 방 1개의 ID
  // cz.getAllStreams().then((res) => {console.log(res);}); // 전체 방 ID 
  // cz.sendPrivateMsg(23, "날씨가 너무 추워요").then((res) => {console.log(res);}); // 개인메시지 보내기
  // cz.subscribeStream().then((res) => {console.log(res);}); // 새 스트림 생성 및 구독 
  // cz.subscribeAnotherUserStream(23).then((res) => {console.log(res);}); // 새 스트림 생성 및 구독 
  // cz.removeStreamSubscription().then((res) => {console.log(res);})
  // cz.removeAnotherUserSubscription(23).then((res) => {console.log(res);});
  cz.getUsersStreams(22, 42).then((res) => {console.log(res);});
}

localTest();

module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
};