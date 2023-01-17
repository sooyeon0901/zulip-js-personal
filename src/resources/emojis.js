const api = require('../api');

function emojis(config) {
  return {
    retrieve: (params) => {
      const url = `${config.apiURL}/realm/emoji`;
      return api(url, config, 'GET', params);
    },
    set: (params) => {
      const url = `${config.apiURL}/realm/emoji/${params.emoji_name}`;
      return api(url, config, 'POST', params);
    },
  };
}

module.exports = emojis;
