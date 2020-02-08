const _ = require('lodash');
const os = require('os');
const path = require('path');
const fs = require('fs');
const yargRoot = require('yargs');
const { getRSA } = require('./lib/utils.js');
const XuetangX = require('./lib/reg');

const xuetangx = new XuetangX(1000);

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
  .command('down [<course>]', 'download the course',
    (yargs) => {
      yargs
        .positional('course', {
          describe: '<course> Which course to download.',
          type: 'string',
        });
    },
    (argv) => {
      const config = readConfig(argv);
      const ck = checkConfig(config);
      if (ck) {
        console.error(ck);
        return;
      }
      console.log(config);
      xuetangx.login(config.username, config.rsaPassword);
    })
  .help()
  .parse;

