const _ = require('lodash');
const Hashes = require('jshashes');
const ifaces = require('os').networkInterfaces();
const NodeRSA = require('node-rsa');

/* eslint-disable */
const rsa = new NodeRSA('-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHVvBLvQ4tMRlni0/GmgmdqObTKFjrYxH008pPzy5hBn9hDY0D4J+ETlAA86W2lGSmEysp9bK33qTN3jJzyzyq7Q7RaShUuFqpXOJkpkwAgSATGg5AjAdXysKqkZZpeV6eHHfKE68oowb43ZjPfY98s7yHSRDvBvX3S/6QdohBHQIDAQAB-----END PUBLIC KEY-----');
rsa.setOptions({ encryptionScheme: 'pkcs1' });

exports.getIp = (ifname, v) => {
  const ips = [];
  let type;
  if (v && v == 'v6') type = 'IPv6';
  else if (v && v == 'v4') type = 'IPv4';
  else type = '';
  const chkIface = (iface) => {
    if (type && iface.family !== type) return false;
    if (type === 'IPv6') {
      if (/fe80::.*/i.test(iface.address))
        return false;
    }
    return !iface.internal;
  };
  if (ifname) {
    _.forEach(_.filter(ifaces[ifname], (iface) => {
      return chkIface(iface);
    }), (iface) => {
      ips.push(iface.address);
    });
  } else {
    _.forEach(ifaces, (ifs) => {
      _.forEach(_.filter(ifs, (iface) => {
        return chkIface(iface);
      }), (iface) => {
        ips.push(iface.address);
      });
    });
  }
  return ips;
};

exports.getMd5 = (pwd) => new Hashes.MD5().hex(pwd);

exports.getRSA = (e) => rsa.encrypt(e, 'base64');
