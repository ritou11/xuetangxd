# 学堂在线视频下载

[![npm](https://img.shields.io/npm/v/@ritou11/xuetangxd.svg?style=flat-square)](https://www.npmjs.com/package/@ritou11/xuetangxd)
[![npm](https://img.shields.io/npm/dt/@ritou11/xuetangxd.svg?style=flat-square)](https://www.npmjs.com/package/@ritou11/xuetangxd)
[![GitHub last commit](https://img.shields.io/github/last-commit/ritou11/xuetangxd.svg?style=flat-square)](https://github.com/ritou11/xuetangxd)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ritou11/xuetangxd.svg?style=flat-square)](https://github.com/ritou11/xuetangxd)
[![license](https://img.shields.io/github/license/ritou11/xuetangxd.svg?style=flat-square)](https://github.com/ritou11/xuetangxd/blob/master/LICENSE.md)

> Author: Nogeek
>
> Email: ritou11@gmail.com

## 使用方法

1. ```yarn global add @ritou11/xuetangxd``` or ```npm i -g @ritou11/xuetangxd```
2. 默认配置文件 ```~/.xuetangxd```，格式如下：```<说明 | 默认值> [可选]```

   ```
   {
       "username": "<Username>",
       ["rsaPassword": "<Password hashed by RSA>",]
       ["password": "<Clear text password>",]
   }
   ```
* 其中rsaPassword可在输入明文密码后使用`xuetangxd dryrun`查看。
3. 命令说明：
```
xuetangxd [command]

Commands:
  xuetangxd dryrun                    show the info & donnot execute
  xuetangxd prepare [<cid>] [<sign>]  prepare the course cache file
  xuetangxd fetch                     fetch the course videos
  xuetangxd down [<cid>] [<sign>]     get the course video links

Options:
  --version           Show version number                              [boolean]
  -c, --config-file   Json file that contains username, md5_password and other
                      infomation.             [string] [default: "~/.xuetangxd"]
  -u, --username      Username of your account.                         [string]
  -p, --password      Plaintext password of your account.               [string]
  -m, --rsa-password  RSA password of your account.                     [string]
  -f, --cache-file    Use specified cache file to start                 [string]
  -o, --output-file   output cache file to the path                     [string]
  -q, --quality       High quality or not                              [boolean]
  --help              Show help                                        [boolean]
```
4. `<cid>`和`<sign>`从课程链接中获取，格式为`https://next.xuetangx.com/course/<sign>/<cid>`.

## TODO

1. 课程代码从课程链接中解析
2. 导出aria2格式的课程视频下载种子
3. 完善异常处理

## 协议

MIT
