const _ = require('lodash');
const os = require('os');
const path = require('path');
const fs = require('fs');
const yargRoot = require('yargs');
const { getRSA, downloadLeaves } = require('./lib/utils.js');
const XuetangX = require('./lib/reg');

const xuetangx = new XuetangX(5000);

const readConfig = ({ configFile, username, password, rsaPassword, quality }) => {
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch (e) { config = {}; }
  const inputConfig = { username, password, rsaPassword, quality };
  _.forEach(inputConfig, (value, key) => { config[key] = value || config[key]; });
  if (config.password) config.rsaPassword = getRSA(config.password);
  return config;
};

const checkConfig = (config) => {
  if (!config.username) return 'No Username';
  if (!config.rsaPassword && !config.password) return 'No Password';
  return false;
};

const handleCourse = async (config, argv, prepare = false) => {
  console.log(`Using ${config.username} RSA: ${config.rsaPassword}`);
  xuetangx.login(config.username, config.rsaPassword).then(async (loginRes) => {
    const { nickname, school } = loginRes;
    console.log(`Login as ${nickname}, ${school}.`);
    let data;
    if (argv.cacheFile) {
      data = JSON.parse(fs.readFileSync(argv.cacheFile));
    }
    if (!data && argv.cid && argv.sign) {
      try {
        const res = await xuetangx.getChapters(argv.cid, argv.sign);
        data = res && res.data;
      } catch (e) {
        console.log('Failed to get chapters online.');
      }
    }
    if (!data) {
      console.log('Failed to get chapters.');
      return;
    }
    data.cid = data.cid || argv.cid;
    data.sign = data.sign || argv.sign;
    /* eslint-disable-next-line */
    const { course_name, course_id } = data;
    /* eslint-disable-next-line */
    const output = argv.outputFile || `${course_id}${course_name}.json`;
    fs.writeFileSync(output, JSON.stringify(data, null, 4));

    console.log('Select all video leaves...');
    const videoLeaves = xuetangx.iterChap(data.course_chapter);
    for (let i = 0; i < videoLeaves.length; i += 1) {
      if (!videoLeaves[i].ccid) {
        console.log(`Getting CCID of ${videoLeaves[i].name}`);
        // eslint-disable-next-line
            videoLeaves[i].ccid = await xuetangx.getVideoCcid(videoLeaves[i].id, data.cid, data.sign);
        console.log(videoLeaves[i].ccid);
      }
    }
    fs.writeFileSync(output, JSON.stringify(data, null, 4));
    for (let i = 0; i < videoLeaves.length; i += 1) {
      if (!videoLeaves[i].link && videoLeaves[i].ccid) {
        console.log(`Getting link of ${videoLeaves[i].name}`);
        // eslint-disable-next-line
            videoLeaves[i].link = await xuetangx.getPlayurl(videoLeaves[i].ccid, config.quality);
        console.log(videoLeaves[i].link);
      }
    }
    fs.writeFileSync(output, JSON.stringify(data, null, 4));
    if (!prepare) {
      downloadLeaves(videoLeaves, './');
    }
  }).catch(() => {
    console.log('Login failed.');
  });
};

module.exports = yargRoot
  .option('c', {
    alias: 'config-file',
    describe: 'Json file that contains username, md5_password and other infomation.',
    default: path.join(os.homedir(), '.xuetangxd'),
    type: 'string',
  })
  .option('u', {
    alias: 'username',
    describe: 'Username of your account.',
    type: 'string',
  })
  .option('p', {
    alias: 'password',
    describe: 'Plaintext password of your account.',
    type: 'string',
  })
  .option('m', {
    alias: 'rsa-password',
    describe: 'RSA password of your account.',
    type: 'string',
  })
  .option('f', {
    alias: 'cache-file',
    describe: 'Use specified cache file to start',
    type: 'string',
  })
  .option('o', {
    alias: 'output-file',
    describe: 'output cache file to the path',
    type: 'string',
  })
  .option('q', {
    alias: 'quality',
    describe: 'High quality or not',
    type: 'boolean',
  })
  .command('dryrun', 'show the info & donnot execute',
    () => {},
    async (argv) => {
      const config = readConfig(argv);
      console.log(argv);
      console.log(`Using ${config.username} RSA: ${config.rsaPassword}`);
    })
  .command('prepare [<cid>] [<sign>]', 'prepare the course cache file',
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
      if ((!argv.cid || !argv.sign) && !argv.cacheFile) {
        console.log('Insufficient input.');
        return;
      }
      await handleCourse(config, argv, true);
    })
  .command('fetch', 'fetch the course videos', () => {},
    (argv) => {
      if (!argv.cacheFile) {
        console.log('Cache file not found.');
        return;
      }
      const data = JSON.parse(fs.readFileSync(argv.cacheFile));
      if (!data) {
        console.log('Failed to get chapters.');
        return;
      }
      console.log('Select all video leaves...');
      const videoLeaves = xuetangx.iterChap(data.course_chapter);
      downloadLeaves(videoLeaves, './');
    })
  .command('down [<cid>] [<sign>]', 'get the course video links',
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
      if ((!argv.cid || !argv.sign) && !argv.cacheFile) {
        console.log('Insufficient input.');
        return;
      }
      handleCourse(config, argv, false);
    })
  .help()
  .parse;

