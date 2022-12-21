// import * as z from "./lib/"
// export function write_msg() {
// }
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { async } = require('@babel/runtime/regenerator');
const zulip = require('./lib');
const config = {
  username: "zulip@cherrycorp.io",
  apiKey: "YFeqVpDmkco4tXRtdnJezpObp3XZ9fJT",
  realm: "https://ai.e4net.net",
};
export async function get_streams() {
    const z = await zulip(config);
    // The zulip object now initialized with config
    console.log(await z.streams.subscriptions.retrieve());    
}

// export function get_streams() {
//     const z = zulip(config);
//     // The zulip object now initialized with config
//     console.log(z.streams.subscriptions.retrieve());    
// }

// get_streams();
