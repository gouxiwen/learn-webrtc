# webrtc_web
for geek time

1.获取设备信息必须在https协议下

2.自己生成证书
mac
参考https://www.jianshu.com/p/9072dce6eb2e

windows
参考https://blog.csdn.net/m0_74824894/article/details/145789047

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./cert/private.pem -out ./cert/csr.crt
```


3.修改hosts文件 etc/hosts

4.chrome提示证书不可信，直接在页面敲thisisunsafe就可以继续访问了

5.出于安全原因，除非用户已被授予访问媒体设备的权限（要想授予权限需要使用 HTTPS 请求），否则 label 字段始终为空。
