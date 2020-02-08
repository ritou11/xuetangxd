const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const { CookieJar } = require('tough-cookie');

class XuetangX {
  constructor(timeout = 1000) {
    this.jar = new CookieJar();
    this.axios = axios.create({
      baseURL: 'https://next.xuetangx.com/',
      timeout,
      jar: this.jar,
      withCredentials: true,
      headers: {
        referer: 'https://next.xuetangx.com/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
        xtbz: 'xt',
        'x-client': 'web',
      },
    });
    axiosCookieJarSupport(this.axios);
    this.iterChap = async (chaps) => {
      const videoLeaves = [];
      chaps.forEach((chap) => {
        const chapName = chap.name;
        // const chapID = chap.id;
        const sections = chap.section_leaf_list;
        console.log(chapName);
        if (sections) {
          sections.forEach((section) => {
            const secName = section.name;
            // const secID = section.id;
            const leaves = section.leaf_list;
            /*
            leaf_type:
            0: 视频
            3: 附件
            4: 习题
          */
            console.log(secName);
            if (leaves) {
              leaves.forEach((leaf) => {
                if (leaf.leaf_type === 0) {
                  console.log(leaf.name);
                  console.log(leaf.leafinfo_id);
                  videoLeaves.push(leaf);
                }
              });
            }
          });
        }
      });
      return videoLeaves;
    };
  }

  async login(username, rsaPassword) {
    await this.axios.post('/api/v1/u/login/e_p/', {
      name: username,
      psw: rsaPassword,
      type: 'PP',
    });
    const basicProfile = await this.axios.get('/api/v1/u/user/basic_profile/', {
      headers: {
        referer: 'https://next.xuetangx.com/',
        accept: ' application/json, text/plain, */*',
      },
    });
    return basicProfile.data.data;
  }

  async getCourseInfo(cid, sign) {
    const { data } = await this.axios.get('/api/v1/lms/learn/product/info', {
      params: {
        cid,
        sign,
      },
    });
    return data;
  }

  async getChapters(cid, sign) {
    const res = await this.axios.get('/api/v1/lms/learn/course/chapter', {
      params: {
        cid,
        sign,
      },
    });
    return res.data;
  }

  async getPlayurl(ccid) {
    const res = await this.axios.get(`/api/v1/lms/service/playurl/${ccid}/`, {
      params: {
        appid: 10000,
      },
    });
    return res.data;
  }

  async getLeafInfo(leafID, cid, sign) {
    const res = await this.axios.get(`/api/v1/lms/learn/leaf_info/${cid}/${leafID}/`, {
      params: {
        sign,
      },
    });
    return res.data;
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
}

module.exports = XuetangX;
