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

}



// eslint-disable-next-line no-unused-vars
function localTest() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  const cz = new CZulip("zulip@cherrycorp.io","YFeqVpDmkco4tXRtdnJezpObp3XZ9fJT","https://ai.e4net.net")
  function handleEvent(event) {console.log(event);}
  cz.callOnEachMessage(handleEvent);

  // cz.getAllUsers().then((res) => {console.log(res);});
  // cz.getOwnUser().then((res) => {console.log(res);});
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
  cz.getUserGroupById(58).then((res) => {console.log(res);});
}

localTest();

module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
};