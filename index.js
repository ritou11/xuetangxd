const _ = require('lodash');
const os = require('os');
const path = require('path');
const fs = require('fs');
const yargRoot = require('yargs');
const { getMd5, getIp } = require('./lib/utils.js');
const ThunetReg = require('./lib/reg');

const thunetReg = new ThunetReg(1000);

const readConfig = ({ configFile, username, password, md5Password, ip }) => {
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch (e) { config = {}; }
  const inputConfig = { username, password, md5Password, ip };
  _.forEach(inputConfig, (value, key) => { config[key] = value || config[key]; });
  if (config.password) config.md5Password = getMd5(config.password);
  return config;
};

const checkConfig = (config) => {
  if (!config.username) return 'No Username';
  if (!config.md5Password && !config.password) return 'No Password';
  return false;
};

const tryLogin = (config) => {
  if (!config.ip) {
    thunetReg.login(config.username, config.md5Password).then(
      ({ data }) => { console.log(data); },
    ).catch(() => {
      console.log('Network error! Try again...');
      setTimeout(() => tryLogin(config), 1000);
    });
  } else {
    thunetReg.reg(config.username, config.md5Password, config.ip).then(
      ({ data }) => { console.log(data); },
    ).catch(() => {
      console.log('Network error! Try again...');
      setTimeout(() => tryLogin(config), 1000);
    });
  }
};

const tryAuth = (config) => {
  thunetReg.auth4(config.username, config.password, config.ip).then(
    ({ data }) => {
      if (data && data.error === 'ok') {
        console.log('Auth Successfully!');
      } else {
        console.log(data);
      }
    },
  ).catch(() => {
    console.log('Network error! Try again...');
    setTimeout(() => tryAuth(config), 1000);
  });
};

module.exports = yargRoot
  .option('c', {
    alias: 'config-file',
    describe: 'Json file that contains username, md5_password and other infomation.',
    default: path.join(os.homedir(), '.thunet-reg'),
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
  .command('login [<ip>]', 'Login my current IP',
    (yargs) => {
      yargs
        .positional('ip', {
          describe: '<ip> Which IP to register.',
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
      tryLogin(config);
    })
  .command('logout', 'Logout my current IP', () => {}, (argv) => {
    const config = readConfig(argv);
    const ck = checkConfig(config);
    if (ck === 'No Username') {
      console.error(ck);
      return;
    }
    thunetReg.logout().then(
      ({ data }) => { console.log(data); },
    );
  })
  .command('auth [<ip>]', 'Register [current] IP with auth4',
    (yargs) => {
      yargs
        .positional('ip', {
          describe: '<ip> Which IP to register.',
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
      tryAuth(config);
    })
  .command('unauth [<ip>]', 'Unregister [current] IP with auth4',
    (yargs) => {
      yargs
        .positional('ip', {
          describe: '<ip> Which IP to register.',
          type: 'string',
        });
    },
    (argv) => {
      const config = readConfig(argv);
      const ck = checkConfig(config);
      if (ck === 'No Username') {
        console.error(ck);
        return;
      }
      thunetReg.unauth4().then(
        ({ data }) => { console.log(data); },
      ).catch(() => { console.log('Logout.'); });
    })
  .command('keeplogin [<delay>]', 'Keep current IP logged in by continuous trying',
    (yargs) => {
      yargs
        .positional('delay', {
          describe: '<delay> Trying interval (seconds)',
          type: 'int',
          default: 30,
        });
    },
    (argv) => {
      const config = readConfig(argv);
      const ck = checkConfig(config);
      if (ck) {
        console.error(ck);
        return;
      }
      const delay = argv.delay || 30;
      tryLogin(config);
      setInterval(() => tryLogin(config), delay * 1000);
    })
  .command('keepauth [<delay>]', 'Keep current IP logged in by continuous trying',
    (yargs) => {
      yargs
        .positional('delay', {
          describe: '<delay> Trying interval (seconds)',
          type: 'int',
          default: 30,
        });
    },
    (argv) => {
      const config = readConfig(argv);
      const ck = checkConfig(config);
      if (ck) {
        console.error(ck);
        return;
      }
      const delay = argv.delay || 30;
      tryAuth(config);
      setInterval(() => tryAuth(config), delay * 1000);
    })
  .command('ip [<v>]', 'Get current IP',
    (yargs) => {
      yargs
        .positional('v', {
          describe: '<v4|v6|all> IPv4 or IPv6',
          type: 'string',
        })
        .option('i', {
          alias: 'ifname',
          describe: 'Name of network interface.',
          type: 'string',
        });
    },
    (argv) => {
      console.log(getIp(argv.ifname, argv.v));
    })
  .help()
  .parse;
