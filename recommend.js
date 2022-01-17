import request from '@/utils/request'
import { obj2Param, timestamp } from '@/utils'
import emptyBanner from '@/assets/empty_thumb.png'

export const reasonMap = {
  '1': '兜底',
  '1000': '兜底',
  '1001': '阅读分类图文热度召回',
  '1002': '基于用户协同过滤',
  '1003': '基于用户w2v',
  '1005': '图文热度召回',
  '1006': '基于内容协同过滤',
  '1007': '基于内容w2v',
  '1008': '文章一级分类热度召回',
  '1009': '视频热度召回',
  '1010': '新内容冷启动',
  '1011': 'Moment召回',
  '1013': '基于新用户选择偏好召回',
  '1014': '基于新用户选择偏好和点击行为召回',
  '1023': '国家热门图文',
  '1024': '国家热门视频',
  '1029': '随机分类图文',
  '1030': '随机分类视频',
  '1032': '阅读分类视频热度召回',
  '1033': '用户实时二级分类图文召回',
  '1034': '用户实时二级分类视频召回',
  '1035': '选择偏好和阅读偏好图文召回',
  '1036': '选择偏好和阅读偏好视频召回',
  '1037': '用户实时一级分类图文召回',
  '1038': '用户实时一级分类视频召回',
  '1044': '问答频道',
  '1061': 'auto分类召回',
  '1062': 'GH自编辑图文召回实验'
}

export function getDocsFeature(idList, type) {
  if (!idList.length) {
    return Promise.resolve([])
  }
  /* one cast
  * {\"id\": \"19264451\", \"title\": \"Sad Photo Of Dr Gakaras First Born Daughter Embracing Her Teary Mom At The Funeral\", \"author\": \"Wama KE\", \"channel_id\": \"031\", \"publish_time\": 1632889348, \"cat\": \"community\", \"cat2\": \"metro\", \"source\": \"Herald KE\", \"content_type\": 1, \"content_style\": 1, \"content_source\": \"\", \"language\": \"en\", \"news_type\": 1, \"country_code\": \"KE\", \"topics\": \"98\", \"source_type\": 1, \"tag_input\": \"trendingnews,videoArticle\", \"duration\": 0, \"feature_keywords\": \"allegedly,child,decease,burial,doctor,winnie,dead,pain,unconscious,family\", \"tags\": \"KE,both,local,Yes,Real Time,Hot\"}
  * */
  return request({
    url: '/doc_feature_sample?ids=' + idList.join(',') + '&type=' + type,
    method: 'get'
  }).then(list => list.filter(({ data }) => !!data).map(({ id, data: strData }) => ({ ...JSON.parse(strData), id: +id })))
}

export function getDocsData(idList, type) {
  if (!idList.length) {
    return Promise.resolve([])
  }
  /*  one cast
  show: 0, // 曝光
  validshow: 0, // 有效曝光
  read: 0, // 点击
  validread: 0, // 有效点击
  readlong: 0, // 阅读时长
  watchlong: 0, // 观看时长
  share: 0, // 被分享次数
  comment: 0, // 评论次
  like: 0, // 点赞次数
  unlike: 0, // 取消点赞次数
  readcomment: 0, // 阅读评论次
  search: 0, // 搜索次数

  * {"RecPagePv":{"ShowPv":5485,"ReadPv":209,"ValidShow":3340,"ValidRead":185,"ReadLong":21040,"SharePv":1,"ReadCommentPv":8},"SimilarPagePv":{"ShowPv":14082,"ReadPv":345,"ValidShow":4719,"ValidRead":333,"ReadLong":69310,"SharePv":1,"CommentPv":1,"LikePv":1,"ReadCommentPv":23}}
  * */
  return request({
    url: '/doc_data_sample?ids=' + idList.join(',') + '&type=' + type,
    method: 'get'
  }).then(list => list.filter(({ data }) => !!data).map(({ id, data: strData }) => {
    const data = JSON.parse(strData)
    data.id = +id
    data.RecPagePv = data.RecPagePv || {}
    data.RecPagePv.ctr = data.RecPagePv.ValidShow ? data.RecPagePv.ValidRead / data.RecPagePv.ValidShow * 100 : 0
    data.RecPagePv.ReadTime = Math.max(data.RecPagePv.ReadLong || 0, data.RecPagePv.WatchLong || 0)
    data.RecPagePv.ReadAvgTime = data.RecPagePv.ReadPv ? data.RecPagePv.ReadTime / data.RecPagePv.ReadPv : 0

    data.SimilarPagePv = data.SimilarPagePv || {}
    data.SimilarPagePv.ctr = data.SimilarPagePv.ValidShow ? data.SimilarPagePv.ValidRead / data.SimilarPagePv.ValidShow * 100 : 0
    data.SimilarPagePv.ReadTime = Math.max(data.SimilarPagePv.ReadLong || 0, data.SimilarPagePv.WatchLong || 0)
    data.SimilarPagePv.ReadAvgTime = data.SimilarPagePv.ReadPv ? data.SimilarPagePv.ReadTime / data.SimilarPagePv.ReadPv : 0

    return data
  }))
}

export function getNewsList(idList, type) {
  if (!idList.length) {
    return Promise.resolve([])
  }
  return request({
    url: '/news_list_sample?ids=' + idList.join(',') + '&type=' + type,
    method: 'get'
  }).then(list => {
    list.forEach(row => {
      row.banners = (row.url_to_small_image || row.url_to_big_image || '').split(',')
      if (!row.banners[0]) {
        row.docResource = (row.docResource || 0) | 8
        row.banners[0] = emptyBanner
      }
    })
    return list
  })
}

const toLowerCaseFirstWord = word => {
  let firstWord = word.charAt(0)
  return word.replace(word.charAt(0), firstWord.toLowerCase())
}

const toLowerCaseObjectKey = obj => {
  let temp = {}
  Object.keys(obj).forEach(key => {
    let tempKey = toLowerCaseFirstWord(key)
    temp[tempKey] = obj[key]
  })
  return temp
}

const parseScooperList = list => {
  const logLength = list.length
  return list.reduce((m, n, requestIndex) => {
    /*  one cast
    * [RecommenderTrace] rec\t{\"requestId\":\"cb4caa16-a592-48ba-b204-21549fcc03b1\",\"uid\":\"6fdfa2110db4968a\",\"gaid\":\"7a6a6054-24bc-4742-905a-9731174248dc\",\"dpid\":\"6fdfa2110db4968a\",\"uuid\":\"f46e66ee-aded-4383-ae56-a9b473f01a03\",\"country\":\"EG\",\"language\":\"ar\",\"count\":8,\"newsType\":[1,2,3,4,5,6,8],\"packageName\":\"com.hatsune.eagleee\",\"clientVersionCode\":\"19104\",\"clientVersionName\":\"V6.1.104\",\"deviceInfo\":\"TECNO/TECNO CF7k/CF7k-H612L-O-180726V18/8.1.0/720*1500\",\"timeZone\":\"GMT+02:00\",\"networkType\":\"WIFI\",\"ignoreContent\":true,\"isWebp\":true,\"appSource\":\"launcher\",\"pageSource\":\"splash_pg\",\"page\":15,\"from\":1,\"direct\":1,\"ip\":\"203.81.177.54\",\"firstOpenTime\":1595228225,\"surveyCategory\":\"فن_وترفيه,مجتمع,سياسة,صحة,اقتصاد,لايف_ستايل\",\"surveyCategoryTs\":1595232100,\"gender\":2}\t{\"requestId\":\"cb4caa16-a592-48ba-b204-21549fcc03b1\",\"uid\":\"6fdfa2110db4968a\",\"groupId\":\"algo_rec_b,\",\"docs\":[{\"newsId\":\"13680158\",\"recallId\":1003,\"contentStyle\":1,\"position\":0,\"recallIds\":\"1003\",\"score\":0.36681476},{\"newsId\":\"13767845\",\"recallId\":1038,\"contentStyle\":2,\"position\":1,\"recallIds\":\"1038,1030,1036\",\"score\":0.45612368},{\"newsId\":\"13644939\",\"recallId\":1003,\"contentStyle\":1,\"position\":2,\"recallIds\":\"1003\",\"score\":0.35644308},{\"newsId\":\"13751519\",\"recallId\":1037,\"contentStyle\":1,\"position\":3,\"recallIds\":\"1029,1037\",\"score\":0.30974033},{\"newsId\":\"13642906\",\"recallId\":1003,\"contentStyle\":1,\"position\":4,\"recallIds\":\"1029,1037,1002,1003\",\"score\":0.2984613},{\"newsId\":\"13770747\",\"recallId\":1003,\"contentStyle\":1,\"position\":5,\"recallIds\":\"1029,1037,1002,1003\",\"score\":0.290139},{\"newsId\":\"13669625\",\"recallId\":1029,\"contentStyle\":1,\"position\":6,\"recallIds\":\"1029\",\"score\":0.28081566},{\"newsId\":\"13792725\",\"recallId\":1010,\"contentStyle\":2,\"position\":7,\"recallIds\":\"1010\",\"score\":-1}],\"strategy\":101}\tinterface_0
    * */
    const logs = n.msg.split('\t')
    try {
      const user = toLowerCaseObjectKey(JSON.parse(logs[1]))
      const recDoc = toLowerCaseObjectKey(JSON.parse(logs[2]))
      const scene = logs[3].split('_')[1]
      return m.concat(recDoc.docs.map((docOrigin, docIndex) => {
        // newsId
        // position
        // score
        let doc = toLowerCaseObjectKey(docOrigin)
        doc.requestId = recDoc.requestId
        doc.id = +doc.newsId
        doc.requestIndex = logLength - requestIndex
        doc.strategy = recDoc.strategy
        doc.requestTimestamp = timestamp(n.timestamp)
        doc.country = user.country
        doc.language = user.language
        doc.packageName = user.packageName
        doc.clientVersionName = user.clientVersionName
        doc.appSource = user.appSource
        doc.pageSource = user.pageSource
        doc.networkType = user.ip + ' ' + user.networkType
        doc.isWebp = user.isWebp
        doc.deviceInfo = user.deviceInfo
        doc.scene = scene
        doc.reason = doc.recallIds.split(',').map(id => reasonMap[id] || id).join(',')
        doc.position = doc.position || docIndex
        return doc
      }))
    } catch (e) {
      return m
    }
  }, [])
}

const parseMeowList = list => {
  try {
    const parseList = list.map(item => JSON.parse(item.msg))
    console.log('parseList', parseList)
    return parseScooperList(parseList)
  } catch (e) {
    console.log(e)
    return []
  }
}

export function getUserRequestLogList(query) {
  return request({
    url: '/user_request_log?' + obj2Param(query),
    method: 'get'
  }).then(list => {
    const type = +query.type
    console.log('list', list)
    switch (type) {
      case 1:
        return parseScooperList(list)
      case 2:
        return parseScooperList(list)
      case 3:
        return parseMeowList(list)
    }
  })
}

export function getUserBehaviorTimeList(query) {
  return request({
    url: '/user_behavior_log?' + obj2Param(query),
    method: 'get'
  }).then(list => {
    /* one cast
    * raw_record partition:8, topic:scooper-action, record:{"cmd":"click","dpid":"188e3271c30e8b94","newsId":"13034717","timestamp":1612516258758,"countryCode":"CI","from":2,"feedFrom":255,"materialType":0,"duration":0,"channelId":"c0000","pct":0,"requestId":"d3fb5b7e-82e7-43ba-b5c1-4e2744fbfded","networkType":"UNKNOWN","ip":""}
    * doc
    * https://km.scooper.news/pages/viewpage.action?pageId=983099#id-%E5%9F%8B%E7%82%B9%E8%AF%B4%E6%98%8E-3.%E4%BA%8B%E4%BB%B6%E8%AF%B4%E6%98%8E
2.2 下列事件是通过服务端已有的接口统计的，比如："imp"事件是通过服务端信息流列表接口统计的。
imp	comment	commentLike	star	like	unlike	login	reg	reply	delStar	delComment	report
2.3 下列事件是通过单独接口上报的: https://track.scooper.news/report
imp	曝光
impValid	有效曝光
click	点击
clickValid	有效点击
readingTime	阅读时长
share	分享
notIntr	不感兴趣
readComment	查看了评论
readPercent	阅读百分比 物料阅读百分比，35代表物料阅读了35%
watchingTime	播放时长 单个视频播放时长单位毫秒
replay	重播
pageTime	页面时长 统计页面可见时长，以一个可见周期为准上报时长，参数中duration字段为时长毫秒数。
appStart	应用每次启动
appStartFirst	当前版本应用首次启动
download_video	点击下载视频
search	搜索
dislikeSpicy	不喜欢辣度文章
readFinish	详情页滚动文章到底的时间
3.6 readPercent
物料阅读百分比，35代表物料阅读了35%
3.7 readComment
用户看到了评论区
3.8 watchingTime
播放时长
3.10 pageTime
页面时长
3.14 readCommentTime
用户看到了评论区停留时长
3.15 readFinish
详情页滚动文章到底的时间（H5通过JsBridge通道上报）

* */
    try {
      list = list.map(({ msg }) => {
        return JSON.parse(msg.split('record:')[1]) || {}
      })
    } catch (e) {
      console.log(e)
    }
    return list.reduce((m, row) => {
      const { newsId, requestId, cmd, timestamp, duration, networkType, ip, pct, originTimestamp, extend } = row
      const recordTimestamp = originTimestamp || timestamp
      const combineId = newsId + requestId
      const cachedDoc = m[combineId || 'common'] = m[combineId || 'common'] || {
        id: +newsId,
        requestId,
        logs: []
      }
      if (combineId) {
        if (cachedDoc[cmd + 'Time']) {
          cachedDoc.duplicate = true
        } else {
          cachedDoc[cmd + 'NetworkType'] = networkType
          cachedDoc[cmd + 'Ip'] = ip
          cachedDoc[cmd + 'Time'] = recordTimestamp
          cachedDoc[cmd + 'Duration'] = extend && extend.duration || +duration || 0
          cachedDoc[cmd + 'Percent'] = +pct || 0
          cachedDoc.recordTimestamp = Math.max(cachedDoc.recordTimestamp || 0, recordTimestamp)
          cachedDoc.firstTimestamp = cachedDoc.firstTimestamp ? recordTimestamp ? Math.min(cachedDoc.firstTimestamp, recordTimestamp) : cachedDoc.firstTimestamp : recordTimestamp
        }
      }
      cachedDoc.logs.push(row)
      return m
    }, {})
  })
}

export function getUserInfo(query) {
  return request({
    url: '/user_info_sample?' + obj2Param(query),
    method: 'get'
  }).then(([feature = {}]) => feature)
}

export function getUserFeature(query) {
  /* one cast
  * {"Dpid":"6fdfa2110db4968a","Country":"EG","Language":"ar","PackageName":"com.hatsune.eagleee","ClientVersionCode":"18132","ClientVersionName":"V6.0.132","DeviceInfo":"TECNO/TECNO CF7k/CF7k-H612L-O-180726V18/8.1.0/720*1500","TimeZone":"GMT+02:00","NetworkType":"WIFI","FrstOpenTime":1595228225,"Ip":"116.235.39.64","Cats":"مجتمع,فن_وترفيه,لايف_ستايل,صحة,سياسة,politique,دين,divertissement,تكنولوجيا,société,lifestyle,technologie,أدب_وثقافة","RCat2":"غرائب_وطرائف,مشاهير_محلية,آراء_دينية_وفتاوى,مرأة,sexygirl"}
  * */
  return request({
    url: '/user_feature_sample?' + obj2Param(query),
    method: 'get'
  }).then(strData => JSON.parse(strData))
}

