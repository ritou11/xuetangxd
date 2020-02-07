# 学堂在线视频下载

[![GitHub last commit](https://img.shields.io/github/last-commit/ritou11/xuetangx.svg?style=flat-square)](https://github.com/ritou11/xuetangx)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ritou11/xuetangx.svg?style=flat-square)](https://github.com/ritou11/xuetangx)
[![license](https://img.shields.io/github/license/ritou11/xuetangx.svg?style=flat-square)](https://github.com/ritou11/xuetangx/blob/master/LICENSE.md)

> Author: Nogeek
>
> Email: ritou11@gmail.com

## 使用方法

1. ```yarn global add @ritou11/xuetangx``` or ```npm i -g @ritou11/xuetangx```
2. 默认配置文件 ```~/.xuetangx```，格式如下：```<说明 | 默认值> [可选]```

   ```
   {
       "username": "<Username>",
       ["md5Password": "<Password hashed by MD5>",]
       ["password": "<Clear text password>",]
   }
   ```
* 其中md5Password仅可用于net.tsinghua的认证，使用auth.tsinghua则需要明文密码。
* 其中MD5可以[在线生成](http://www.miraclesalad.com/webtools/md5.php)。

## 协议

MIT
