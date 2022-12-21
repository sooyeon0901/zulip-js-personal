// // import * as z from "./lib/"
// // export function write_msg() {
// // }

const zulip = require('../lib');

class CZulip {
  constructor(email, apiKey, uri) {
    this.z = zulip({username: email, apiKey, realm: uri});
    this.msgQ = null;
  }

  async getZulip() {
    return this.z;
  }

  async getStreams() {
    const z = await this.z;
    // The zulip object now initialized with config
    return z.streams.subscriptions.retrieve();    
  }

  // eventHandler(event)
  async callOnEachMessage(eventHandler)  {
    const z = await this.z;
    await z.callOnEachEvent(eventHandler, ['message']);
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

}

// localTest();

module.exports = {
  // eslint-disable-next-line object-shorthand
  CZulip: CZulip,
};