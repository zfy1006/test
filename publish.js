const path = require('path')
const fs = require('fs')
const os = require('os')
const md5 = require('md5')

// /user/[Your name]/.oss.json
const AliOSS = require('ali-oss')
const OSSCONFIG = require(path.join(os.homedir(), './.oss.json'))

// /user/[Your name]/.aws/credentials
const AWS = require('aws-sdk')
const cloudfront = new AWS.CloudFront()

function updateCloudFront({ id, path }) {
  console.log(`cloudfront:${path[0]}`)
  return cloudfront.createInvalidation({
    DistributionId: id,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: path.length,
        Items: path
      }
    }
  }).promise()
}

const OSS = {
  getOss({ bucket, region = 'oss-eu-central-1' }) {
    return new AliOSS({
      bucket,
      region,
      accessKeyId: OSSCONFIG.accessKeyId,
      accessKeySecret: OSSCONFIG.accessKeySecret
    })
  },
  put(name, file, options) {
    const oss = OSS.getOss(options)
    return oss.put(name, file, options)
  }
}

function listObjects(bucket, prefix) {
  const oss = OSS.getOss({ bucket })
  return oss.list({ prefix, 'max-keys': 1000 }).then(res => {
    return res.objects || []
  })
}

function listFiles(folderPath, arr) {
  const files = fs.readdirSync(folderPath)
  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filepath = path.join(folderPath, filename)
    const stats = fs.statSync(filepath)
    if (stats.isDirectory()) {
      listFiles(filepath, arr)
    } else {
      arr.push(filepath)
    }
  }
}

function getFileList(folderPath) {
  const arr = []
  listFiles(folderPath, arr)
  return arr
}

function getOptions({ packagePath, filepath, prefix, maxAge }) {
  const options = { headers: {}}
  options.file = fs.readFileSync(filepath)
  const relativePath = path.relative(packagePath, filepath)
  options.name = (prefix ? path.join(prefix, relativePath) : relativePath).replace(/\\/g, '/')
  const ext = path.extname(filepath)
  // ContentType
  if (ext === '' || ext === '.html') {
    options.headers['Content-Type'] = 'text/html;charset=utf-8'
  } else if (ext === '.js') {
    options.headers['Content-Type'] = 'application/javascript'
  } else if (ext === '.css') {
    options.headers['Content-Type'] = 'text/css'
  } else if (ext === '.jpg') {
    options.headers['Content-Type'] = 'image/jpeg'
  } else if (ext === '.png') options.headers['Content-Type'] = 'image/png'
  // CacheControl
  if (ext !== '' && ext !== '.html' && ext !== '.appcache') {
    options.headers['Cache-Control'] = `max-age=${maxAge
                                                  || 31536000}`
  }
  return options
}

async function ossUpload({ bucket, packagePath, prefix, maxAge }) {
  const files = getFileList(packagePath)
  const fileList = files.map(filepath => ({ filepath, ignore: false }))
  // oss该路径下的文件列表
  const objects = await listObjects(bucket, prefix)
  for (let i = 0; i < fileList.length; i++) {
    const fileItem = fileList[i]
    const filepath = fileItem.filepath
    const options = getOptions({ packagePath, filepath, prefix, maxAge })
    // 查询oss上是否已有该文件，若有并且md5相同，则忽略该文件
    const existedItem = objects.find(item => item.name === options.name)
    // oss返回的etag开头和结尾用双引号包起来了，如{ETag: '"397754ba49e9e0cf4e7c190da78dda05"'}，所以移除双引号后再判断
    if (existedItem && (existedItem.etag.replace(/"/g, '').toLowerCase() === md5(options.file).toLowerCase())) {
      fileItem.ignore = true
      console.log(`ignore ${filepath}`)
    } else {
      await OSS.put(options.name, options.file, { bucket, headers: options.headers })
      console.log(`ok ${filepath}`)
    }
  }
  return fileList
}

/*
  @bucket 必填，项目所在的存储桶名称
  @packagePath 必填，本地包文件所在的路径(绝对路径，会从该路径下读取文件并上传)
  @prefix 选填，若项目不在存储桶的根下，则需填写prefix
  @maxAge 选填，为资源配置cache-control: max-age=xxx
*/
async function publishFiles({ bucket, packagePath, prefix, maxAge, cdnOptions }) {
  try {
    console.log('uploading files...')
    const files = await ossUpload({ bucket, packagePath, prefix, maxAge })
    console.log('uploading successfully', files)
    if (!cdnOptions) {
      return
    }
    console.log('update cdn ', cdnOptions.vendor)
    switch (cdnOptions.vendor) {
      case 'cloudfront':
        await updateCloudFront({
          id: cdnOptions.id,
          path: [`${cdnOptions.path || ''}/*`]
        })
        break
      default:
        console.log('No Match CDN vendor')
        return
    }
    console.log('update cdn successfully')
  } catch (e) {
    return Promise.reject(e)
  }
}

const PUBLISH_CONFIG = {
  production: {
    bucket: 'scooper-recommend-debug',
    packagePath: path.resolve(__dirname, './dist'),
    prefix: '',
    cdnOptions: {
      id: 'ECNTVOTBQPS0P',
      vendor: 'cloudfront'
    }
  },
  test: {
    bucket: 'scooper-recommend-debug',
    packagePath: path.resolve(__dirname, './dist'),
    prefix: 'test',
    cdnOptions: {
      id: 'ECNTVOTBQPS0P',
      vendor: 'cloudfront'
    }
  }
}

publishFiles(PUBLISH_CONFIG[process.env.NODE_ENV]).then(() => {
  process.exit(0)
}).catch(e => {
  console.error(e)
  process.exit(127)
})
