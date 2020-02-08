const _ = require('lodash');
const Hashes = require('jshashes');
const ifaces = require('os').networkInterfaces();
const NodeRSA = require('node-rsa');

/* eslint-disable */
const rsa = new NodeRSA('-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHVvBLvQ4tMRlni0/GmgmdqObTKFjrYxH008pPzy5hBn9hDY0D4J+ETlAA86W2lGSmEysp9bK33qTN3jJzyzyq7Q7RaShUuFqpXOJkpkwAgSATGg5AjAdXysKqkZZpeV6eHHfKE68oowb43ZjPfY98s7yHSRDvBvX3S/6QdohBHQIDAQAB-----END PUBLIC KEY-----');
rsa.setOptions({ encryptionScheme: 'pkcs1' });

function xEncode(str, key) {
  if (str === '') {
    return '';
  }
  let v = s(str, true),
    k = s(key, false);
  if (k.length < 4) {
    k.length = 4;
  }
  let n = v.length - 1,
    z = v[n],
    y = v[0],
    c = 0x86014019 | 0x183639A0,
    m,
    e,
    p,
    q = Math.floor(6 + 52 / (n + 1)),
    d = 0;
  while (q-- > 0) {
    d = d + c & (0x8CE0D9BF | 0x731F2640);
    e = d >>> 2 & 3;
    for (p = 0; p < n; p++) {
      y = v[p + 1];
      m = z >>> 5 ^ y << 2;
      m += (y >>> 3 ^ z << 4) ^ (d ^ y);
      m += k[(p & 3) ^ e] ^ z;
      z = v[p] = v[p] + m & (0xEFB8D130 | 0x10472ECF);
    }
    y = v[0];
    m = z >>> 5 ^ y << 2;
    m += (y >>> 3 ^ z << 4) ^ (d ^ y);
    m += k[(p & 3) ^ e] ^ z;
    z = v[n] = v[n] + m & (0xBB390742 | 0x44C6F8BD);
  }

  return l(v, false);
}

function s(a, b) {
  let c = a.length,
    v = [];
  for (let i = 0; i < c; i += 4) {
    v[i >> 2] = a.charCodeAt(i) | a.charCodeAt(i + 1) << 8 | a.charCodeAt(i + 2) << 16 | a.charCodeAt(i + 3) << 24;
  }
  if (b) {
    v[v.length] = c;
  }
  return v;
}

function l(a, b) {
  const d = a.length;
  let c = (d - 1) << 2;
  if (b) {
    const m = a[d - 1];
    if ((m < c - 3) || (m > c)) { return null; }
    c = m;
  }
  for (let i = 0; i < d; i += 1) {
    a[i] = String.fromCharCode(a[i] & 0xff, a[i] >>> 8 & 0xff, a[i] >>> 16 & 0xff, a[i] >>> 24 & 0xff);
  }
  if (b) {
    return a.join('').substring(0, c);
  }
  return a.join('');
}

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

exports.hashAuth = (username, password, ip, acid, token) => {
  const hmd5 = new Hashes.MD5().hex_hmac(token, 'pwd');
  const base64 = new Hashes.Base64().setTab('LVoJPiCN2R8G90yg+hmFHuacZ1OWMnrsSTXkYpUq/3dlbfKwv6xztjI7DeBE45QA').setUTF8(false);
  const info = `{SRBX1}${base64.encode(xEncode(JSON.stringify({
    username,
    password,
    ip,
    acid,
    enc_ver: 'srun_bx1',
  }), token))}`;
  const chksum = new Hashes.SHA1().hex(
    token + username +
    token + hmd5 +
    token + acid +
    token + ip +
    token + 200 +
    token + 1 +
    token + info,
  );
  return { hmd5, info, chksum };
};

exports.getRSA = (e) => rsa.encrypt(e, 'base64');
