const _ = require('lodash');
const os = require('os');
const path = require('path');
const fs = require('fs');
const yargRoot = require('yargs');
const { getRSA } = require('./lib/utils.js');
const XuetangX = require('./lib/reg');

const xuetangx = new XuetangX(5000);

const readConfig = ({ configFile, username, password, rsaPassword, ip }) => {
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch (e) { config = {}; }
  const inputConfig = { username, password, rsaPassword, ip };
  _.forEach(inputConfig, (value, key) => { config[key] = value || config[key]; });
  if (config.password) config.rsaPassword = getRSA(config.password);
  return config;
};

const checkConfig = (config) => {
  if (!config.username) return 'No Username';
  if (!config.rsaPassword && !config.password) return 'No Password';
  return false;
};

module.exports = yargRoot
  .option('c', {
    alias: 'config-file',
    describe: 'Json file that contains username, md5_password and other infomation.',
    default: path.join(os.homedir(), '.xuetangx'),
    type: 'string',
  })
  .option('u', {
    alias: 'username',
    describe: 'Username of your Tsinghua account.',
    type: 'string',
  })
  .option('p', {
    alias: 'password',
    describe: 'Plaintext password of your Tsinghua account.',
    type: 'string',
  })
  .option('m', {
    alias: 'md5-password',
    describe: 'MD5 password of your Tsinghua account.',
    type: 'string',
  })
  .command('test <cacheFile>', 'testload the course',
    (yargs) => {
      yargs
        .positional('cacheFile', {
          describe: '<cacheFile> The path of cached file',
          type: 'string',
        });
    },
    async (argv) => {
      const config = readConfig(argv);
      const ck = checkConfig(config);
      if (ck) {
        console.error(ck);
        return;
      }
      console.log(`Using ${config.username} ${config.rsaPassword}`);
      xuetangx.login(config.username, config.rsaPassword).then((loginRes) => {
        const { nickname, school } = loginRes;
        console.log(`Login as ${nickname}, ${school}.`);
        const data = JSON.parse(fs.readFileSync(argv.cacheFile));
        if (!data) {
          console.log('Failed to get chapters.');
          return;
        }
        const videoLeaves = xuetangx.iterChap(data.course_chapter);
        videoLeaves.forEach(async (leaf) => {
          leaf.ccid = 5;
          // await xuetangx.getVideoLink(leaf.leafinfo_id, data.cid, data.sign);
        });
        fs.writeFileSync(`outputs/${data.course_id}${data.course_name}.test.json`, JSON.stringify(data, null, 4));
      }).catch((e) => {
        console.log('Login failed.', e);
      });
    })
  .command('down <cid> <sign>', 'download the course',
    (yargs) => {
      yargs
        .positional('cid', {
          describe: '<cid> Example: 1462810',
          type: 'string',
        })
        .positional('sign', {
          describe: '<sign> Example: ynu12021002034',
          type: 'string',
        });
    },
    async (argv) => {
      const config = readConfig(argv);
      const ck = checkConfig(config);
      if (ck) {
        console.error(ck);
        return;
      }
      console.log(`Using ${config.username} ${config.rsaPassword}`);
      xuetangx.login(config.username, config.rsaPassword).then(async (loginRes) => {
        const { nickname, school } = loginRes;
        console.log(`Login as ${nickname}, ${school}.`);
        xuetangx.getChapters(argv.cid, argv.sign).then((res) => {
          const data = res && res.data;
          if (!data) {
            console.log('Failed to get chapters.');
            return;
          }
          /* eslint-disable */
          const { course_name, course_id } = data;
          data.cid = argv.cid;
          data.sign = argv.sign;
          fs.writeFileSync(`outputs/${course_id}${course_name}.json`, JSON.stringify(data, null, 4));
          /* eslint-enable */
          const videoLeaves = xuetangx.iterChap(data.course_chapter);
          xuetangx.getVideoLink(videoLeaves[0].leafinfo_id, argv.cid, argv.sign);
        }).catch((e) => {
          console.log(e);
        });
      }).catch(() => {
        console.log('Login failed.');
      });
    })
  .help()
  .parse;

