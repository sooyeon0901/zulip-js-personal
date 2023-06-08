
/* eslint-disable */
const hashReplacements = new Map([
  ["%", "."],
  ["(", ".28"],
  [")", ".29"],
  [".", ".2E"],
]);
export function by_stream_topic_url(stream_id, topic) {
  // Wrapper for web use of internal_url.by_stream_topic_url
  return internal_url.by_stream_topic_url(stream_id, topic, stream_data.maybe_get_stream_name);
}

export function pm_perma_link(message) {
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

export function by_conversation_and_time_url(message) {
    const absolute_url =
        window.location.protocol +
        "//" +
        window.location.host +
        "/" +
        window.location.pathname.split("/")[1];

    const suffix = "/near/" + encodeHashComponent(message.id);

    if (message.type === "stream") {
        return absolute_url + by_stream_topic_url(message.stream_id, message.topic) + suffix;
    }

    return absolute_url + pm_perma_link(message) + suffix;
}

export function encodeHashComponent(str) {
  return encodeURIComponent(str).replace(/[%().]/g, (matched) => hashReplacements.get(matched));
}

function localTest() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  // const cz = new CZulip("zulip@cherrycorp.io","YFeqVpDmkco4tXRtdnJezpObp3XZ9fJT","https://ai.e4net.net")
  // const cz = new CZulip("suyeun1215@naver.com","aR4WwdKS28O34SJsSOGNZQAGXeRlLfL0","https://ai.e4net.net")
  const cz = new CZulip("1000000000000002597@dev.cworld.cherry","jHziQ89YjPSUcOsLnQSZuxB38XuylOUO","https://dev-zulip.letscherry.io/")
  // const u = new Urls(`{"id":5030,"sender_id":22,"content":"<p>gsgsg</p>","recipient_id":2270,"timestamp":1675667127,"client":"website","subject":"스크롤","topic_links":[],"is_me_message":false,"reactions":[],"submessages":[],"flags":["read"],"sender_full_name":"관리자예용","sender_email":"zulip@cherrycorp.io","sender_realm_str":"","display_recipient":"(주)바사아(주)","type":"stream","stream_id":268,"avatar_url":null,"content_type":"text/html"}`)
  // let message = {"id":5030,"sender_id":22,"content":"<p>gsgsg</p>","recipient_id":2270,"timestamp":1675667127,"client":"website","subject":"스크롤","topic_links":[],"is_me_message":false,"reactions":[],"submessages":[],"flags":["read"],"sender_full_name":"관리자예용","sender_email":"zulip@cherrycorp.io","sender_realm_str":"","display_recipient":"(주)바사아(주)","type":"stream","stream_id":268,"avatar_url":null,"content_type":"text/html"}
//{operator: "not", operand: {operator: "sender", operand: 6}},
  // let narrow = [
  //   {"operator": "has", "operand": "reactions"},
  //   {"operator": "reactions", "operand": "national park"}
  // ];
  // let sendStreamMsgOthers = {
  //   anchor: "newest",
  //   num_before: 100,
  //   num_after: 0,
  //   client_gravatar: false,
  //   apply_markdown: false //
  // };
  // cz.getMsg(narrow, sendStreamMsgOthers).then((res) => {console.log(res);});
  cz.removeEmojiReaction(1520, "tennis").then((res) => {console.log(res);});
}

localTest();