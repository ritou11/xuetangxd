const axios = require('axios');
const { hashAuth } = require('./utils.js');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const { CookieJar } = require('tough-cookie');

class XuetangX {
  constructor(timeout = 1000) {
    const jar = new CookieJar();
    this.axios = axios.create({
      baseURL: 'https://next.xuetangx.com/',
      timeout,
      jar,
      withCredentials: true,
      headers: {
        referer: 'https://next.xuetangx.com/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
      },
    });
    axiosCookieJarSupport(this.axios);
  }

  async login(username = '+8617888833599', encoded_pwd = 'u8It44k1kwoTDtz+71ouNX30m6daeClu8+3cYCpdVqklfpMqeeKE2qYNqtPUxCgDw7S5yE/blceZGzepj18F8k9O7jtYADaqxMjo2kSJbugs7y7BSFbxmAgZyDFOtEac+JZ5UYB/7GcIFmDpLjdudsRubHfkXcZdsdF8kQclfyQ=') {
    await this.axios.post('/api/v1/u/login/e_p/', {
      name: username,
      psw: encoded_pwd,
      type: 'PP',
    });
    try {
      const basicProfile = await this.axios.get('/api/v1/u/user/basic_profile/', {
        headers: {
          referer: 'https://next.xuetangx.com/',
          accept: ' application/json, text/plain, */*',
        },
      });
      const { nickname, school } = basicProfile.data.data;
      console.log(`Login as ${nickname}, ${school}.`);
    } catch (error) {
      console.log('Login failed.');
      return false;
    }
    return true;
  }

  async getToken(username, ip = '') {
    const res = await this.axios.get(
      '/cgi-bin/get_challenge', {
        params: {
          callback: 'Q',
          username,
          ip,
        },
      },
    );
    try {
      const { challenge } = JSON.parse(res.data.slice(2, -1));
      return challenge;
    } catch (e) {
      console.error(e);
      console.log(res.data);
    }
    return '';
  }

  async getAcId() {
    const { data } = await this.axios.get();
    const match = data.match(/index_([0-9]+)\.html/);
    if (match && match.length > 1) {
      return match[1];
    }
    return '1';
  }

  async reg(username, md5pwd, ip) {
    return this.axios.get(
      '/cgi-bin/srun_portal', {
        params: {
          action: 'login',
          user_name: username,
          user_password: `{MD5_HEX}${md5pwd}`,
          ac_id: 1,
          ip,
        },
      },
    );
  }

  async auth4(username, password, ip = '') {
    const token = await this.getToken(username, ip);
    const acid = await this.getAcId();
    const { hmd5, info, chksum } = hashAuth(username, password, ip, acid, token);
    return this.axios.post('/cgi-bin/srun_portal', {
      action: 'login',
      username,
      password: `{MD5}${hmd5}`,
      ac_id: acid,
      type: 1,
      n: 200,
      double_stack: '1',
      ip,
      info,
      chksum,
    });
  }
}

module.exports = XuetangX;
