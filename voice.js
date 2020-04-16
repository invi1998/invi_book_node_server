//https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8%E6%B5%81%E7%A8%8B
//科大讯飞在线语言合成api文档

const Base64 = require('js-base64').Base64
const md5 = require('js-md5')
const qs = require('qs')
const CryptoJS = require('crypto-js')
const WebSocket = require('ws')
var fs = require('fs')
const hmac_sha256 = require('js-sha256').sha256
const http = require('http')
const mp3FilePath = require('./const').mp3FilePath
const resURL = require('./const').resURL


function createVoice(req, res) {

    const text = req.query.text
    const lang = req.query.lang

    const fileName = new Date().getTime()
    const filePath = `${mp3FilePath}/${fileName}.mp3`
    console.log(filePath)
    const downloadUrl = `${resURL}/mp3/${fileName}.mp3`
    console.log(downloadUrl)
    // const text = '我星号你星号B的铁男，心态崩了啊。这波单杀不是为了证明什么，我只想说，你可以永远信任瓶子。这局拿下'
    let engineType = 'int65'
    if (lang.toLowerCase === 'en') {
        engineType = 'intp65_en'
    }

    websocketRes(text, lang, fileName)
    res.json({
        error_code: 0,
        msg: '下载成功',
        path: downloadUrl
    })

    function websocketRes(text, engineType, fileName) {

        // 系统配置 
        const config = {
            // 请求地址
            hostUrl: "wss://tts-api.xfyun.cn/v2/tts",
            host: "tts-api.xfyun.cn",
            //在控制台-我的应用-在线语音合成（流式版）获取
            appid: "5e9845a8",
            //在控制台-我的应用-在线语音合成（流式版）获取
            apiSecret: "396f32dd3ec0fd596ec964e5ca2112d1",
            //在控制台-我的应用-在线语音合成（流式版）获取
            apiKey: "c13b34ff4b2b03fd4d77e77ce63bca02",
            text: `${text}`,
            uri: "/v2/tts",
        }

        // 获取当前时间 RFC1123格式
        let date = (new Date().toUTCString())
        // 设置当前临时状态为初始化

        let wssUrl = config.hostUrl + "?authorization=" + getAuthStr(date) + "&date=" + date + "&host=" + config.host
        let ws = new WebSocket(wssUrl)

        // 连接建立完毕，读取数据进行识别
        ws.on('open', () => {
            console.log("websocket connect!")
            send()
            // 如果之前保存过音频文件，删除之
            if (fs.existsSync('*.mp3')) {
                fs.unlink('*.mp3', (err) => {
                    if (err) {
                        console.log('remove error: ' + err)
                    }
                })
            }
        })

        // 得到结果后进行处理，仅供参考，具体业务具体对待
        ws.on('message', (data, err) => {
            if (err) {
                console.log('message error: ' + err)
                return
            }

            let res = JSON.parse(data)

            if (res.code != 0) {
                console.log(`${res.code}: ${res.message}`)
                ws.close()
                return
            }

            let audio = res.data.audio
            let audioBuf = Buffer.from(audio, 'base64')

            save(audioBuf, fileName)

            if (res.code == 0 && res.data.status == 2) {
                ws.close()
            }
        })

        // 资源释放
        ws.on('close', () => {
            console.log('connect close!')
        })

        // 连接错误
        ws.on('error', (err) => {
            console.log("websocket connect err: " + err)
        })

        // 鉴权签名
        function getAuthStr(date) {
            let signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`
            let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret)
            let signature = CryptoJS.enc.Base64.stringify(signatureSha)
            let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
            let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
            return authStr
        }

        // 传输数据
        function send() {
            let frame = {
                // 填充common
                "common": {
                    "app_id": config.appid
                },
                // 填充business
                "business": {
                    aue: 'lame',
                    sfl: 1,
                    "auf": "audio/L16;rate=16000",
                    "vcn": "xiaoyan",
                    "tte": "UTF8",
                    ent: engineType,
                },
                // 填充data
                "data": {
                    "text": Buffer.from(config.text).toString('base64'),
                    "status": 2
                }
            }
            ws.send(JSON.stringify(frame))
        }

        // 保存文件
        function save(data, fileName) {
            fs.writeFile(`./${fileName}.mp3`, data, {
                flag: 'a'
            }, (err) => {
                if (err) {
                    console.log('save error: ' + err)
                    return
                }
                console.log('文件保存成功')
            })
        }
    }

}

module.exports = createVoice