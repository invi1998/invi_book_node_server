const express = require('express')
const mysql = require('mysql')
const constant = require('./const')
const cors = require('cors')
const voice = require('./voice')


const app = express()
app.use(cors())

app.get('/', (req, res) => {
    res.send(new Date().toDateString())
})

//编写连接字符串
function connect() {
    return mysql.createConnection({
        host: '101.200.121.107',
        port: '3306',
        user: 'invi',
        password: 'sh269jgl105#LL',
        database: 'book'
    })
}

function randomArray(n, l) {
    let rnd = []
    for (let i = 0; i < n; i++) {
        rnd.push(Math.floor(Math.random() * l))
    }
    return rnd
}


function createDate(results, key) {
    return handleDate(results[key])
}

function handleDate(data) {
    if (!data.cover.startsWith('http://')) {
        data['cover'] = `${constant.resURL}/img${data.cover}`
    }
    data['selected'] = false
    data['private'] = false
    data['cache'] = false
    data['haveRead'] = 0
    return data
}

function createGuessYouLikeDate(data) {
    const n = parseInt(randomArray(1, 6)) + 1
    data['type'] = n
    switch (n) {
        case 1:
            data['result'] = data.id % 2 === 0 ? '《Fungal Disease In Britain And TheUn》' : '《Global History And New Polycentric》'
            data['percent'] = data.id % 2 === 0 ? '24%' : '63%'
            break
        case 2:
            data['result'] = data.id % 2 === 0 ? '《Ethics And Civil Drones》' : '《Reconsidering Constitutional For》'
            data['percent'] = data.id % 2 === 0 ? '93%' : '77%'
            break
        case 3:
            data['result'] = data.id % 2 === 0 ? '《Russia STurn To The East》' : '《Transgovernance》'
            data['percent'] = data.id % 2 === 0 ? '13%' : '47%'
            break
        case 4:
            data['result'] = data.id % 2 === 0 ? '《Ship And Offshore Structure Design》' : '《Bioeconomy》'
            data['percent'] = data.id % 2 === 0 ? '82%' : '43%'
            break
        case 5:
            data['result'] = data.id % 2 === 0 ? '《Ranaviruses》' : '《Protocols For Pre-Field Screening》'
            data['percent'] = data.id % 2 === 0 ? '92%' : '43%'
            break
        case 6:
            data['result'] = data.id % 2 === 0 ? '《Finite Difference Computing WithP》' : '《Advances In Discrete Differential》'
            data['percent'] = data.id % 2 === 0 ? '75%' : '54%'
            break
    }
    return data
}

function createRecommendData(data) {
    data['readers'] = Math.floor(data.id / 2 * randomArray(1, 50))
    return data
}

function createCategoryIds(n){
    const arr = []
    constant.category.forEach((item,index)=>{
        arr.push(index+1)
    })
    const result = [] //根据传入的参数N随机抽取的分类数
    for(let i = 0;i<n;i++){
        //获取的随机数不能重复(所以生成的随机数在每次获取到随机数时都减一)
        const ran =Math.floor(Math.random()*(arr.length-i))
        //获取分类对应的序号
        result.push(arr[ran])
        //将已经获取的随机数取代掉，用最后一个数据取代
        arr[ran] = arr[arr.length-i-1]
    }
    return result
}

function createCategoryListDate(data){
    //创建分类ID
    const categoryIds = createCategoryIds(6)
    const result =[]
    categoryIds.forEach(categoryId=>{
        const sublist = data.filter(item=>item.category===categoryId).slice(0,4)
        sublist.map(item=>{
            return handleDate(item)
        })
        result.push({
            category:categoryId,
            list:sublist
        })
    })
    return result.filter(item=>item.length === 4)
}

app.get('/book/home', (req, res) => {
    const conn = connect()
    conn.query('select * from book where cover != \'\'', (err, results) => {
        const length = results.length
        const guessYouLike = [] //猜你喜欢
        const banner = constant.resURL+'/image/bg02.jpg' //首页横幅
        const recommend = [] //推荐图书
        const featured = [] //精选图书
        const random = [] //随机推荐图书
        const categoryList = createCategoryListDate(results) //分类列表
        const categories = [{//分类id及其数量和封面背景
                category: 1,
                num: 56,
                img1: constant.resURL + '/cover/cs/A978-3-319-62533-1_CoverFigure.jpg',
                img2: constant.resURL + '/cover/cs/A978-3-319-89366-2_CoverFigure.jpg'
            },
            {
                category: 2,
                num: 51,
                img1: constant.resURL + '/cover/ss/A978-3-319-61291-1_CoverFigure.jpg',
                img2: constant.resURL + '/cover/ss/A978-3-319-69299-9_CoverFigure.jpg'
            },
            {
                category: 3,
                num: 32,
                img1: constant.resURL + '/cover/eco/A978-3-319-69772-7_CoverFigure.jpg',
                img2: constant.resURL + '/cover/eco/A978-3-319-76222-7_CoverFigure.jpg'
            },
            {
                category: 4,
                num: 60,
                img1: constant.resURL + '/cover/edu/A978-981-13-0194-0_CoverFigure.jpg',
                img2: constant.resURL + '/cover/edu/978-3-319-72170-5_CoverFigure.jpg'
            },
            {
                category: 5,
                num: 23,
                img1: constant.resURL + '/cover/eng/A978-3-319-39889-1_CoverFigure.jpg',
                img2: constant.resURL + '/cover/eng/A978-3-319-00026-8_CoverFigure.jpg'
            },
            {
                category: 6,
                num: 42,
                img1: constant.resURL + '/cover/env/A978-3-319-12039-3_CoverFigure.jpg',
                img2: constant.resURL + '/cover/env/A978-4-431-54340-4_CoverFigure.jpg'
            },
            {
                category: 7,
                num: 7,
                img1: constant.resURL + '/cover/geo/A978-3-319-56091-5_CoverFigure.jpg',
                img2: constant.resURL + '/cover/geo/978-3-319-75593-9_CoverFigure.jpg'
            },
            {
                category: 8,
                num: 18,
                img1: constant.resURL + '/cover/his/978-3-319-65244-3_CoverFigure.jpg',
                img2: constant.resURL + '/cover/his/978-3-319-92964-4_CoverFigure.jpg'
            },
            {
                category: 9,
                num: 13,
                img1: constant.resURL + '/cover/law/2015_Book_ProtectingTheRightsOfPeopleWit.jpeg',
                img2: constant.resURL + '/cover/law/2016_Book_ReconsideringConstitutionalFor.jpeg'
            },
            {
                category: 10,
                num: 24,
                img1: constant.resURL + '/cover/ls/A978-3-319-27288-7_CoverFigure.jpg',
                img2: constant.resURL + '/cover/ls/A978-1-4939-3743-1_CoverFigure.jpg'
            },
            {
                category: 11,
                num: 6,
                img1: constant.resURL + '/cover/lit/2015_humanities.jpg',
                img2: constant.resURL + '/cover/lit/A978-3-319-44388-1_CoverFigure_HTML.jpg'
            },
            {
                category: 12,
                num: 14,
                img1: constant.resURL + '/cover/bio/2016_Book_ATimeForMetabolismAndHormones.jpeg',
                img2: constant.resURL + '/cover/bio/2017_Book_SnowSportsTraumaAndSafety.jpeg'
            },
            {
                category: 13,
                num: 16,
                img1: constant.resURL + '/cover/bm/2017_Book_FashionFigures.jpeg',
                img2: constant.resURL + '/cover/bm/2018_Book_HeterogeneityHighPerformanceCo.jpeg'
            },
            {
                category: 14,
                num: 16,
                img1: constant.resURL + '/cover/es/2017_Book_AdvancingCultureOfLivingWithLa.jpeg',
                img2: constant.resURL + '/cover/es/2017_Book_ChinaSGasDevelopmentStrategies.jpeg'
            },
            {
                category: 15,
                num: 2,
                img1: constant.resURL + '/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg',
                img2: constant.resURL + '/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg'
            },
            {
                category: 16,
                num: 9,
                img1: constant.resURL + '/cover/mat/2016_Book_AdvancesInDiscreteDifferential.jpeg',
                img2: constant.resURL + '/cover/mat/2016_Book_ComputingCharacterizationsOfDr.jpeg'
            },
            {
                category: 17,
                num: 20,
                img1: constant.resURL + '/cover/map/2013_Book_TheSouthTexasHealthStatusRevie.jpeg',
                img2: constant.resURL + '/cover/map/2016_Book_SecondaryAnalysisOfElectronicH.jpeg'
            },
            {
                category: 18,
                num: 16,
                img1: constant.resURL + '/cover/phi/2015_Book_TheOnlifeManifesto.jpeg',
                img2: constant.resURL + '/cover/phi/2017_Book_Anti-VivisectionAndTheProfessi.jpeg'
            },
            {
                category: 19,
                num: 10,
                img1: constant.resURL + '/cover/phy/2016_Book_OpticsInOurTime.jpeg',
                img2: constant.resURL + '/cover/phy/2017_Book_InterferometryAndSynthesisInRa.jpeg'
            },
            {
                category: 20,
                num: 26,
                img1: constant.resURL + '/cover/psa/2016_Book_EnvironmentalGovernanceInLatin.jpeg',
                img2: constant.resURL + '/cover/psa/2017_Book_RisingPowersAndPeacebuilding.jpeg'
            },
            {
                category: 21,
                num: 3,
                img1: constant.resURL + '/cover/psy/2015_Book_PromotingSocialDialogueInEurop.jpeg',
                img2: constant.resURL + '/cover/psy/2015_Book_RethinkingInterdisciplinarityA.jpeg'
            },
            {
                category: 22,
                num: 1,
                img1: constant.resURL + '/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg',
                img2: constant.resURL + '/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg'
            }
        ]

        randomArray(21, length).forEach(key => {
            guessYouLike.push(createGuessYouLikeDate(createDate(results, key)))
        })

        randomArray(3, length).forEach(key => {
            recommend.push(createRecommendData(createDate(results, key)))
        })

        randomArray(6, length).forEach(key => {
            featured.push(createDate(results, key))
        })

        randomArray(1, length).forEach(key => {
            random.push(createDate(results, key))
        })

        res.json({
            guessYouLike,
            banner,
            recommend,
            featured,
            categoryList,
            categories,
            random
        })

        conn.end()
    })
})

app.get('/book/detail',(req,res)=>{
    const conn = connect()
    const fileName = req.query.fileName
    const sql = `select * from book where fileName = '${fileName}'`
    conn.query(sql,(err,results)=>{
        if(err){
            res.json({
                error_code:1,
                msg:'电子书详情获取失败'
            })
        }else{
            if(results&&results.length===0){
                res.json({
                    error_code:1,
                    msg:'电子书详情获取失败！'
                })
            }else{
                const book = handleDate(results[0])
                res.json({
                    error_code:0,
                    msg:"成功",
                    data:book
                })
            }
        }
        conn.end()
    })
})

app.get('/book/list',(req,res)=>{
    const conn = connect()
    conn.query('select * from book where cover!=\'\'',(err,results)=>{
        if(err){
            res.json({
                error_code:1,
                msg:'获取失败'
            })
        }else{
            results.map(item=>handleDate(item))
            const data = {}
            constant.category.forEach(categoryText=>{
                data[categoryText]=results.filter(item=>item.categoryText === categoryText)
            })
            res.json({
                error_code:0,
                msg:"成功",
                data: data,
                total:results.length
            })
        }
        conn.end()
    })
})

app.get('/book/flat-list',(req,res)=>{
    const conn = connect()
    conn.query('select * from book where cover!=\'\'',(err,results)=>{
        if(err){
            res.json({
                error_code:1,
                msg:'获取失败'
            })
        }else{
            results.map(item=>handleDate(item))
            res.json({
                error_code:0,
                msg:"成功",
                data: results,
                total:results.length
            })
        }
        conn.end()
    })
})

app.get('/book/shelf',(req,res)=>{
    res.json({
        bookList:[]
    })
})

app.get('/voice',(req,res)=>{
    voice(req,res)
})

const server = app.listen(3000, () => {
    const host = server.address().address
    const port = server.address().port

    console.log('server is listening at http://%s:%s', host, port)
}) 