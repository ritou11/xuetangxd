const axios = require('axios');
const loopInterval = require('interval-promise');
const { hashAuth } = require('./utils.js');

class ThunetReg {
  constructor(timeout = 1000) {
    this.axios = axios.create({
      baseURL: 'http://net.tsinghua.edu.cn/',
      timeout,
    });
    this.auth4Axios = axios.create({
      baseURL: 'http://auth4.tsinghua.edu.cn/',
      timeout,
    });
  }

  async getToken(username, ip = '') {
    const res = await this.auth4Axios.get(
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
    return this.auth4Axios.post('/cgi-bin/srun_portal', {
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

  async unauth4(username, password, ip = '') {
    return this.auth4Axios.post('/cgi-bin/srun_portal', {
      action: 'logout',
      username,
      user_ip: ip,
    });
  }

  async login(username, md5pwd) {
    return this.axios.get(
      '/do_login.php', {
        params: {
          action: 'login',
          username,
          password: `{MD5_HEX}${md5pwd}`,
          ac_id: 1,
        },
      },
    );
  }

  async logout() {
    return this.axios.get(
      '/do_login.php', {
        params: {
          action: 'logout',
        },
      },
    );
  }

  async loopReg(username, md5pwd, ip, interval) {
    console.log(`Started, interval time = ${interval}s`);
    loopInterval(
      async () => {
        this.reg(username, md5pwd, ip).then(
          ({ data }) => {
            console.log(data);
          },
        );
      }, interval * 1000,
    );
  }
}

module.exports = ThunetReg;
