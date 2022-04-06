## 1.采集音视频
getUserMedia(MediaStreamConstraints)获得一个流对象MediaStream
```
const mediaStreamContrains = {
    video: true,
    audio: true
};

const mediaStreamContrains = {
    video: {
        frameRate: {min: 20},
        width: {min: 640, ideal: 1280},
        height: {min: 360, ideal: 720},
        aspectRatio: 16/9
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }
};
```
## 2.利用摄像头给自己拍照
### 编码帧和非编码帧
* 非编码帧：一幅完整的图像，播放器播放的都是非编码帧
* 编码帧：经过编码器压缩的帧（H264/H265,VP8/VP9)，编码帧有三种：I帧，P帧，B帧
    * I 帧：关键帧。压缩率低，可以单独解码成一幅完整的图像。
    * P 帧：参考帧。压缩率较高，解码时依赖于前面已解码的数据。
    * B 帧：前后参考帧。压缩率最高，解码时不光依赖前面已经解码的帧，而且还依赖它后面的 P 帧。换句话说就是，B 帧后面的 P 帧要优先于它进行解码，然后才能将 B 帧解码。

## 3.rtp和rtcp
都使用udp进行传输
rtp专门用来传输音视频数据
rtcp用来解决传输过程中的丢包、乱序、抖动等问题以及发送/接收报告

## 4.sdp
### 在 SDP 中如何设置音视频的传输码率呢？
b=<bwtype>:<bandwidth>用来设置宽带，通过设置宽带来设置码率

b=CT给出了所有媒体的总带宽数字

b=AS给出单个媒体的宽带

因此通过在sdp中设置 b=AS:xxxx  可以设置音视频的最大码率

参考：rfc4566#page-16，sdp规范：https://datatracker.ietf.org/doc/html/rfc4566#page-16

## 5.webrtc建立连接
### 四种candidate类型：host、srflx、prflx、relay
### NAT 分类为 4 种类型：
* 完全锥型 NAT
* IP 限制型 NAT
* 端口限制型 NAT（既限制IP又限制端口）
* 对称型 NAT（每个连接都生成新的端口甚至IP映射）

**对称型 NAT 与对称型 NAT 是无法进行 P2P 穿越的**

**对称型 NAT 与端口限制型 NAT 也是无法进行 P2P 连接的**

原因：

首先，明确一点，不管是 A 连接 B，还是 B 连接 A，只要有一个连接成功就算打洞成功
对称型的一端 A 通过 stun 服务器获取的【ip/端口】被对方 B 拿到（通过信令）后在自己的 NAT 上创建了映射记录（通过向 A 发送 udp 包，此时 A 是收不到的，因为 A 是对称型，A 只有 stun 服务器的映射），而 A 在拿到 B 的【ip/端口】后向 B 发送 udp 包时使用的是 stun 服务器获取的【ip/端口】映射，这个映射的端口与之前 B 已经创建的映射记录不一致，由于 B 是端口限制型，因此 B 收不到 A 发的包。

### 关于prflx的理解：

在进行NAT穿越时，如果可以进行穿越，则它向对端发送 binding request请求，binding response就会带回 prflx 类型的 IP 地址和端口，它们就形成了 prflx类型的 candidate。也就是对等端观察到的IP 地址和端口。

## 6.音视频质量控制
### 影响音视频质量的因素有两大方面：
- 网络质量，包括物理链路的质量、带宽的大小、传输速率的控制等。
- 数据，包括音视频压缩码率、分辨率大小、帧率等。

对于传输速率的控制，理论上的做法是将低传输速率，而 webrtc 的做法是直接丢包以保证实时性

可以手动控制码率：RTCRtpSendParameters.encodings[0].maxBitrate = bw * 1000;RTCRtpSender.setParameters(RTCRtpSendParameters)

分辨率是在设置了ideal之后webrtc自动调节

调整帧率对于阐述质量的影响不大，原因是在同一个 GOP（Group Of Picture）中，除了 I/IDR 帧外，B 帧和 P 帧的数据量是非常小的。
通过sdp进行动态控制音视频质量需要先断开链接，然后修改sdp，重新进行协商连接

## 7.webRrtc的通信安全如何保证？
### 总结一句话就是用户名和密码验证身份合法性，指纹信息验证身份真实性。
1. 互换验证信息：账号、密码、指纹信息会在sdp中发给对方
a=ice-ufrag:khLS
a=ice-pwd:cxLzteJaJBou3DspNaPsJhlQ
a=fingerprint:sha-256 FA:14:42:3B:C7:97:1B:E8:AE:0C2:71:03:05:05:16:8F:B9:C7:98:E9:60:43:4B:5B:2C:28:EE:5C:8F3
2. 验证身份合法性：连接时各端先将自己的用户名和密码发给对方，对方通过对比之前sdp里收到的用户名和密码确认身份
3. 验证身份真实型:
这个过程是用DTLS（Datagram Transport Layer Security）实现的，可以理解成DTLS就是在UDP协议上实现的TLS协议，因此握手过程和TLS基本一样，双方互发证书然后验证收到的证书，用sdp里收到的指纹信息验证证书的完整性，而TLS里用到的CA证书认证的。
4. 交换加密公钥：
DTLS协议采用 C/S 模式进行通信，其中发起请求的一端为客户端，接收请求的为服务端，由服务端确认加密算法，如选择了密钥交换算法则需要交换公钥，交换公钥和确认加密算法和TLS一样
5. 数据传递：
握手结束后，所有音视频数据和控制数据都在加密通道传输（SRTP/SRTCP），数据通道复用DTLS的公钥和算法（SCTP）。

## 8.多人音视频通信的架构选择
### 1. Mesh方案
各端互相连接，stun/turn服务器制做NAT打洞，不做转发（因为太复杂了） 

* 优点：

    开发简单，不需要开发流媒体服务器

    客户端充分利用宽带资源

    节省服务端宽带成本

* 缺点：

    对客户端上行宽带占有大，同时cpu，内存等资源占有大，超过4人通话就会有问题

    如果打洞不成功就无法连接，要使打洞失败的人连接就需要做更多可靠性设计

### 2. MCU方案
媒体流服务器中转、混合所有流
* 优点：

    客户端体验好，硬件视频会议使用广泛，技术成熟
* 缺点：

    对服务端cpu要求高

    要解码、编码、混流，所以延迟大

    对服务端容量要求高，一般最多支持十几路

### 3. SFU方案
媒体流服务器转发音视频流，支持 WebRTC 多方通信的媒体服务器基本都是 SFU 结构，目前许多 SFU 实现都支持 SVC 模式和 Simulcast 模式，用于适配 WiFi、4G 等不同网络状况，以及 Phone、Pad、PC 等不同终端设备。
* 优点：

    对服务器资源占用少

    实时性高

    灵活性大，适应不同的网络状况和终端类型

* 缺点：

    各端的流可能不同步，画面不统一

    客户端同时观看多路流，窗口显示、渲染比较麻烦，录制，多路流回放比较困难

    总结下来SFU的优势更加明显一些

### Simulcast 模式或 SVC 模式
为了适应不同的网络和终端的两种视频模式

* Simulcast将生成多种分辨率的格式发送

* SVC将视频分成三层发送

## 9.流媒体服务器
### 搭建Medooze的sfu
```
git clone https://github.com/medooze/sfu.git
cd sfu
npm install
// 在 sfu 目录下生成自签名证书文件：
openssl req -sha256 -days 3650 -newkey rsa:1024 -nodes -new -x509 -keyout server.key -out server.cert
// 注意：运行上面的命令生成证书的过程中需要填写一些字段，Country Name不能为空，可以填写CN、US等，其它可以为空
node index.js IP
```
上面命令中的 IP 是测试机器的 IP 地址，如果用内网测试，你可以将它设置为 127.0.0.1。如果你想用外网访问，则可以指定你的云主机的外网 IP 地址。另外需要注意的是，该服务启动后默认监听的端口是 8084，所以你在访问该服务时要指定端口为 8084

### sfu.js里的有些方法已经废弃，需要更新才能跑起来

createEncodedVideoStreams --> createEncodedStreams

forceEncodedVideoInsertableStreams --> encodedInsertableStreams

readableStream --> readable

writableStream --> writable
## 10.webrtc端到端加密
### WebRTC Insertable Streams是WebRTC的一个新特性，提供用户操作编码后数据的能力，目前依然是试验性的功能。
* 首先开启插入逻辑能力
```
var pc = new RTCPeerConnection({
    encodedInsertableStreams: true,  
});
```
* 发送端加密
```
for (const track of stream.getTracks()) {
    //Add track
    const sender = pc.addTrack(track,stream);
    //If encrypting/decrypting
    if (isCryptoEnabled)  {
        //Get insertable streams
        const senderStreams = sender.createEncodedStreams();
        //Create transform stream for encryption
        let senderTransformStream = new TransformStream({
            start() {},
            flush() {},
            transform: encrypt
        });
        //Encrypt
        senderStreams.readable
            .pipeThrough(senderTransformStream)
            .pipeTo(senderStreams.writable);
    }
}
```
* 接收端加密
```
pc.ontrack = (event) => {
    //If encrypting/decrypting
    if (isCryptoEnabled) {
        //Create transfor strem fro decrypting
        const transform = new TransformStream({
            start() {},
            flush() {},
            transform: decrypt
        });
        //Get the receiver streams for track
        let receiverStreams = event.receiver.createEncodedStreams();
        //Decrytp
        receiverStreams.readable
            .pipeThrough(transform)
            .pipeTo(receiverStreams.writable);
    }
    addRemoteTrack(event);
};
```
参考文章：

https://zhuanlan.zhihu.com/p/360415322

https://w3c.github.io/webrtc-encoded-transform/

## 11.rtmp和hls协议
### rtmp数据格式和flv文件的关系就是flv文件=flv头+rtmp数据，可以说是同一个东西，一个是多媒体文件，一个是音视频流
### flv文件是基于流式的，结构是flv头+固定结构音视频数据（Pre TagSize 和 Tag），因此可以很方便地进行拼接而不破坏文件结构，正因为这种特性，所以flv特别适合录制，多段录制然后拼接，也很方方便实时回放，只要录制几分钟就可以边录边放了
* 优点：
    * 流式播放，实时性高
    * 基于TCP，可靠
* 缺点：
    * 需要flash插件支持
    * ios不支持
    * Adobe已不在维护

在浏览器使用哔哩哔哩的flv.js播放flv文件

### hls基于切片，由索引文件+多个ts文件组成
* 优点：
    * 基于http，不受防火墙的限制
    * 根据客户的网络带宽情况进行自适应码率的调整
    * 苹果产品原生支持
* 缺点：
    * 基于http短连接，需要缓冲，实时性差

在浏览器使用video.js可以播放hls协议的m3u8文件
