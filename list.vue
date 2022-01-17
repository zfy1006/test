<template>
  <div class="recommend">
    <div class="margin-bottom-xxs">
      <el-select v-model="listQuery.type" placeholder="Project Type" class="margin-right-sm search-item-main" size="small" style="width: 106px">
        <el-option v-for="t in projectType" :key="t.value" :label="t.name" :value="t.value" />
      </el-select>
      <el-input v-model.trim="listQuery.uid" class="search-item-main" style="width: 388px" size="small" type="text" placeholder="Search DPID" @keypress.native.enter="pullData">
        <span slot="prepend">DPID</span>
      </el-input>
      <el-button class="bg-green margin-left-sm" size="small" icon="el-icon-search" @click="pullData">Search</el-button>
      <el-button class="bg-blue margin-left-sm fr" size="small" icon="el-icon-document" @click="rawVisible = true">
        Raw Data
      </el-button>
      <el-popover trigger="click">
        <el-button slot="reference" class="bg-blue fr" size="small" icon="el-icon-question">Help</el-button>
        <a href="recommend_help.png" target="_blank" class="pointer"><img src="../../../public/recommend_help.png" style="max-width: 100%; width: 800px;" alt="help"></a>
      </el-popover>
    </div>
    <div class="text-xss margin-bottom-xxs solid">
      <el-tabs v-model="characterTab" tab-position="left" style="height: 160px;">
        <el-tab-pane name="user" label="User" class="scrollbar text-sss" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.all" />
          <div class="margin-top-xxs">
            <el-tooltip>
              <span slot="content">First Open: {{ user.FrstOpenTime | dateFormat(undefined, timezoneOffset) }}</span>
              <div v-clipboard="user.FrstOpenTime" class="cu-capsule radius">
                <div class="cu-tag sm bg-red">ALive Days</div>
                <div class="cu-tag sm line-red">{{ user.aliveDay }}</div>
              </div>
            </el-tooltip>
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-green">Gender</div>
              <div class="cu-tag sm line-black">{{ ['(None)', 'Man', 'Woman'][user.gender] || user.gender }}
              </div>
            </div>
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-black">Birthday</div>
              <div class="cu-tag sm line-black">{{ user.birthday }}</div>
            </div>
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-black">Country</div>
              <div class="cu-tag sm line-black">{{ user.Country }} {{ user.Language }} {{ user.TimeZone }}</div>
            </div>
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-black">SystemLanguage</div>
              <div class="cu-tag sm line-black">{{ user.SystemLanguage }}</div>
            </div>
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-black">Version</div>
              <div class="cu-tag sm line-black">{{ user.ClientVersionCode }} {{ user.ClientVersionName }}</div>
            </div>
          </div>
          <div class="margin-top-xxs">
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-black">Category 1</div>
              <div class="cu-tag sm line-black">{{ user.Cats }}</div>
            </div>
          </div>
          <div class="margin-top-xxs">
            <div class="cu-capsule radius">
              <div class="cu-tag sm bg-black">Category 2</div>
              <div class="cu-tag sm line-black">{{ user.RCat2 || '(empty)' }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="date" label="Date" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.date" />
        </el-tab-pane>
        <el-tab-pane name="scene" label="Scene" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.scene" :group-map="sceneTypeMap" />
        </el-tab-pane>
        <el-tab-pane name="recall" label="Recall" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.recallId" :group-map="reasonMap" />
        </el-tab-pane>
        <el-tab-pane name="strategy" label="Strategy" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.strategy" />
        </el-tab-pane>
        <el-tab-pane name="network" label="Network" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.networkType" />
        </el-tab-pane>
        <el-tab-pane name="source" label="Source" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.appSource" />
        </el-tab-pane>
        <el-tab-pane name="package" label="Package" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.packageName" />
        </el-tab-pane>
        <el-tab-pane name="version" label="Version" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.clientVersionName" />
        </el-tab-pane>
        <el-tab-pane name="device" label="Device" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.deviceInfo" />
        </el-tab-pane>
        <el-tab-pane name="language" label="Language" class="scrollbar" style="height: 160px;overflow: auto;">
          <group-list :list="analiseData.language" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="margin-bottom-xs">
      <div class="inline margin-right">
        <span class="inline margin-right-xs">News ID: </span>
        <el-input v-model="keyword" class="search-item-main" style="width: 120px" size="small" type="text" placeholder="Search News Id" />
      </div>
      <div class="inline margin-right">
        <span class="inline margin-right-xs">Behavior: </span>
        <el-select v-model="astType" size="small" placeholder="All">
          <el-option v-for="ast of articleStateTypes" :key="ast.value" :label="ast.text" :value="ast.value">
            <div :class="[currentFilterAnaliseData[ast.value] ? 'text-black' : 'text-grey']">
              <span>{{ ast.text }}</span>
              <span v-if="currentFilterAnaliseData[ast.value]" class="fr">{{
                currentFilterAnaliseData[ast.value]
              }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <div class="inline margin-right">
        <span class="inline margin-right-xs">Resource: </span>
        <el-select v-model="docResource" size="small" placeholder="All">
          <el-option :label="`All ${analiseDocResource[0]}`" :value="0">All {{ analiseDocResource[0] }}</el-option>
          <el-option :label="`Duplicated News ${analiseDocResource[4]}`" :value="4">
            <span class="text-red">Duplicated News {{ analiseDocResource[4] }}</span>
          </el-option>
          <el-option label="Error Image" :value="8">
            <span class="text-red">Error Image {{ analiseDocResource[8] }}</span>
          </el-option>
          <el-option :label="`Duplicated Log ${analiseDocResource[2]}`" :value="2">
            <span class="text-red">Duplicated Log {{ analiseDocResource[2] }}</span>
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="margin-bottom-xxs">
      <span class="inline margin-right-xs">Date: </span>
      <el-radio-group v-model="dayTimestamp" size="small">
        <el-radio-button :label="-1">All</el-radio-button>
        <el-radio-button v-for="t in dayTimestampList" :key="t" :label="t">
          {{ t | dateFormat('M-D', timezoneOffset) }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <el-tabs v-model="scene" type="card">
      <el-tab-pane v-for="sceneItem of validSceneTypes" :key="sceneItem.value" :label="sceneItem.label" :name="sceneItem.value" />
    </el-tabs>
    <loading :show="listLoading" />
    <div class="r">
      <div style="position: absolute; left: -20px;top:0;" class="text-gray solid pointer">
        <div class="radius-top-sm" style="height: 1em;line-height: 1.1;" :class="[timeDirection === 1 ? 'bg-green' : '']" @click="timeDirection = 1">
          <span class="el-icon-arrow-up" /></div>
        <div class="radius-bottom-sm" style="height: 1em;line-height: 1.1;" :class="[timeDirection === -1 ? 'bg-green' : '']" @click="timeDirection = -1">
          <span class="el-icon-arrow-down" /></div>
      </div>
    </div>
    <div v-for="(postItem, index) in list" :key="postItem.positionStr" class="flex text-left align-start text-sss padding-tb-xs margin-top-xs solid-bottom">
      <div>
        <div class="flex align-center justify-between margin-bottom-xxs text-black text-bold text-ss">
          <div :class="{hidden: index > 0 && list[index - 1].recordTimeDateStr === postItem.recordTimeDateStr }">
            {{ postItem.recordTimeDateStr }}
            <span v-show="user.FrstOpenTime" class="cu-tag line-red sm text-sss">
              {{ getOpenTimeDistance((postItem.timestamp)) }} Day
            </span>
          </div>
          <div class="text-right" :class="{hidden: index > 0 && list[index - 1].recordTimeStr === postItem.recordTimeStr }">
            {{ postItem.recordTimeStr }}
          </div>
          <div style="width: 36px; height: 1px;" :class="{hidden: index > 0 && list[index - 1].recordTimeStr === postItem.recordTimeStr && list[index - 1].recordTimeStr === postItem.recordTimeStr }" class="bg-black" />
        </div>
        <div class="flex justify-end margin-bottom-xxs">
          <div class="cu-tag sm radius margin-right" :class="[positionColor[postItem.sceneIndex % 12 + 1]]">
            {{ postItem.positionStr }}
          </div>
          <div class="cu-tag sm line-blue radius" :class="{hidden: !postItem.impTime }">
            <i class="cuIcon-attentionforbid" />
            {{ postItem.impTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
          <div class="cu-tag sm line-blue radius" :class="{hidden: !postItem.impValidTime }">
            <i class="cuIcon-attention" />
            {{ postItem.impValidTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
        </div>
        <div class="flex justify-end margin-bottom-xxs">
          <div class="cu-tag sm line-purple radius" :class="{hidden: !postItem.readingTimeTime }" :title="postItem.readingTimeDuration">
            <i class="cuIcon-attention" />
            {{ postItem.readingTimeDuration / 1000 | shortTime }}
          </div>
          <div class="cu-tag sm line-green radius" :class="{hidden: !postItem.clickTime }">
            <i class="cuIcon-usefull" />
            {{ postItem.clickTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
          <div class="cu-tag sm line-green radius" :class="{hidden: !postItem.clickValidTime }">
            <i class="cuIcon-usefullfill" />
            {{ postItem.clickValidTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
        </div>
        <div class="flex justify-end margin-bottom-xxs">
          <div class="cu-tag sm line-pink radius" :class="{hidden: !postItem.watchingTimeTime }" :title="postItem.watchingTimeDuration">
            <i class="cuIcon-video" />
            {{ postItem.watchingTimeDuration / 1000 | shortTime }}
          </div>
          <div class="cu-tag sm line-yellow radius" :class="{hidden: !postItem.likeTime }">
            <i class="cuIcon-likefill" />
            {{ postItem.likeTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
          <div class="cu-tag sm line-black radius" :class="{hidden: !postItem.unlikeTime }">
            <i class="cuIcon-like" />
            {{ postItem.unlikeTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
        </div>
        <div class="flex justify-end margin-bottom-xxs">
          <div class="cu-tag sm line-orange radius" :class="{hidden: !postItem.readCommentTime }">
            <i class="cuIcon-comment" />
            {{ postItem.readCommentTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
          <div class="cu-tag sm line-purple radius" :class="{hidden: !postItem.commentTime }">
            <i class="cuIcon-edit" />
            {{ postItem.commentTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
          <div class="cu-tag sm line-pink radius" :class="{hidden: !postItem.shareTime }">
            <i class="cuIcon-share" />
            {{ postItem.shareTime | dateFormat('H:N:S', timezoneOffset) }}
          </div>
        </div>
        <div class="flex justify-end margin-bottom-xxs">
          <div class="cu-tag sm line-purple radius" :class="{hidden: !postItem.readFinishTime }" :title="postItem.readFinishDuration">
            <i class="cuIcon-read" />
            {{ postItem.readFinishDuration / 1000 | shortTime }}
          </div>
          <div class="cu-tag sm line-purple radius hidden">
            <i class="cuIcon-pay" />
          </div>
          <div class="cu-tag sm line-brown radius" :class="{hidden: !postItem.readPercentTime }">
            <i class="cuIcon-tag" />
            {{ postItem.readPercentPercent | englishNumber }}%
          </div>
        </div>
      </div>
      <div class="line-1-1 margin-lr-sm" style="width:240px;">
        <div class="flex justify-between margin-bottom-xxs">
          <a v-for="banner in postItem.banners" :key="banner" :href="banner" target="_blank"><img :src="banner" style="width:72px;height: 54px;" class="radius margin-right-xxs pointer" alt="banner" @error="imageLoadError(postItem)"></a>
        </div>
        <div class="flex justify-between margin-bottom-xxs">
          <div><span class="cu-tag sm line-brown radius-xs">{{ postItem.contentStyleName || '(style)' }}</span>
            {{ postItem.id }}
            <span class="pointer text-blue cuIcon-searchlist" @click="viewArticleRaw(postItem)" />
          </div>
          <div>Publish: {{ postItem.publishTimeStr }}</div>
        </div>
        <div class="flex justify-between margin-bottom-xxs">
          <div>Recall {{ postItem.recallIds }}</div>
          <div class="cu-tag sm line-black radius">{{ postItem.score }}</div>
        </div>
        <div class="margin-bottom-xxs">
          {{ postItem.reason }}
        </div>
        <div class="flex justify-between align-center">
          <div v-if="postItem.sceneName" class="cu-tag sm line-red radius-xs">{{ postItem.sceneName }}</div>
          <div v-else class="cu-tag line-gray radius">Empty Scene</div>
          <div>Strategy {{ postItem.strategy }}</div>
        </div>
      </div>
      <div class="flex-sub text-black" style="width:400px; min-height: 168px;">
        <div class="break-line line-1-2 margin-bottom-xxs">
          <div class="cu-tag sm radius" :class="[['', 'line-blue', 'line-green', 'line-black', 'line-purple'][postItem.source_type] || 'line-grey']">
            {{ postItem.sourceName || '(source)' }}
          </div>
          <template v-if="listQuery.type != 2">
            <a class="cu-tag sm radius-xs bg-blue pointer" @click="viewPost(postItem)">M</a>
            <a class="cu-tag sm radius-xs bg-green pointer" @click="viewPostCDN(postItem)">CDN</a>
            <a class="cu-tag sm radius-xs bg-red pointer" @click="viewPostPHX(postItem)">PHX</a>
          </template>
          <template v-else>
            <a class="cu-tag sm radius-xs bg-blue pointer" @click="viewJoga(postItem)">JOGA</a>
          </template>
          <a v-if="postItem.url" :href="postItem.url" rel="noreferrer" target="_blank" class="cu-tag sm radius-xs bg-brown pointer">Origin</a>
          <span class="margin-left-xs text-bold text-ss" :title="postItem.title">
            {{ (postItem.title || '').slice(0, 42) || '(title)' }}
            <span v-if="postItem.title && postItem.title.length > 41">...</span>
          </span>
        </div>
        <div class="margin-bottom-xxs">
          <div class="cu-capsule radius margin-right-xxs">
            <div class="cu-tag sm bg-black">Author</div>
            <div class="cu-tag sm line-black">{{ postItem.author || '(author)' }}</div>
          </div>
          <div class="cu-tag sm line-black radius">{{ postItem.idna || '(nation)' }}</div>
          <div class="cu-tag sm line-black radius margin-right-sm">{{ postItem.language || '(lan)' }}</div>
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Topic</div>
            <div class="cu-tag sm line-grey">{{ postItem.topics || '(empty)' }}</div>
          </div>
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Source</div>
            <div class="cu-tag sm line-grey">
              {{ postItem.source || '(source)' }}
            </div>
          </div>
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Network</div>
            <div class="cu-tag sm line-grey radius">{{ postItem.networkType }}</div>
          </div>
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">{{ postItem.appSource }}</div>
            <div class="cu-tag sm line-grey radius">{{ postItem.clientVersionName }}</div>
          </div>
        </div>
        <div class="margin-bottom-xxs">
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">TagsInput</div>
            <div class="cu-tag sm line-grey">{{ postItem.tag_input || '(empty)' }}</div>
          </div>
        </div>
        <div class="margin-bottom-xxs">
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Tag</div>
            <div class="cu-tag sm line-grey">{{ postItem.tags || '(empty)' }}</div>
          </div>
        </div>
        <div class="margin-bottom-xxs">
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">PostNowTopic</div>
            <div class="cu-tag sm line-grey">{{ postItem.post_now_topics || '(empty)' }}</div>
          </div>
        </div>
        <div class="margin-bottom-xxs">
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Keyword</div>
            <div class="cu-tag sm line-grey">{{ postItem.feature_keywords || '(empty)' }}</div>
          </div>
        </div>
        <div class="margin-bottom-xxs">
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Category {{ postItem.cat || '(empty)' }}</div>
            <div class="cu-tag sm line-grey">{{ postItem.cat2 || '(second_cat)' }}</div>
          </div>
          <div class="cu-capsule radius">
            <div class="cu-tag sm bg-grey">Country</div>
            <div class="cu-tag sm line-grey radius">{{ postItem.country_code }}</div>
          </div>
        </div>
        <div class="margin-bottom-xxs data-fixed-width text-left">
          <div>
            <span class="inline">ForYou: {{ postItem.RecPagePv.ctr | englishNumber }}%</span>
            <div class="cu-tag sm line-blue radius">
              <i class="cuIcon-attentionforbid" />
              {{ postItem.RecPagePv.ShowPv | shortNumber }}
            </div>
            <div class="cu-tag sm line-blue radius">
              <i class="cuIcon-attention" />
              {{ postItem.RecPagePv.ValidShow | shortNumber }}
            </div>
            <div class="cu-tag sm line-green radius">
              <i class="cuIcon-usefull" />
              {{ postItem.RecPagePv.ReadPv | shortNumber }}
            </div>
            <div class="cu-tag sm line-green radius">
              <i class="cuIcon-usefullfill" />
              {{ postItem.RecPagePv.ValidRead | shortNumber }}
            </div>
            <div class="cu-tag sm line-yellow radius">
              <i class="cuIcon-likefill" />
              {{ postItem.RecPagePv.LikePv | englishNumber }}
            </div>
            <div class="cu-tag sm line-black radius">
              <i class="cuIcon-like" />
              {{ postItem.RecPagePv.UnLikePv | englishNumber }}
            </div>
            <div class="cu-tag sm line-purple radius">
              <i class="cuIcon-comment" />
              {{ postItem.RecPagePv.ReadCommentPv | shortNumber }}
            </div>
            <div class="cu-tag sm line-pink radius">
              <i class="cuIcon-share" />
              {{ postItem.RecPagePv.SharePv | shortNumber }}
            </div>
            <div class="cu-tag sm line-pink radius">
              <i class="cuIcon-time" />
              {{ postItem.RecPagePv.ReadTime | shortTime }}
            </div>
            <div class="cu-tag sm line-purple radius">
              <i class="cuIcon-timefill" />
              <i class="cuIcon-profile" />
              {{ postItem.RecPagePv.ReadAvgTime | shortTime }}
            </div>
          </div>
          <div>
            <span class="inline">Relate: {{ postItem.SimilarPagePv.ctr | englishNumber }}%</span>
            <div class="cu-tag sm line-blue radius">
              <i class="cuIcon-attentionforbid" />
              {{ postItem.SimilarPagePv.ShowPv | shortNumber }}
            </div>
            <div class="cu-tag sm line-blue radius">
              <i class="cuIcon-attention" />
              {{ postItem.SimilarPagePv.ValidShow | shortNumber }}
            </div>
            <div class="cu-tag sm line-green radius">
              <i class="cuIcon-usefull" />
              {{ postItem.SimilarPagePv.ReadPv | shortNumber }}
            </div>
            <div class="cu-tag sm line-green radius">
              <i class="cuIcon-usefullfill" />
              {{ postItem.SimilarPagePv.ValidRead | shortNumber }}
            </div>
            <div class="cu-tag sm line-yellow radius">
              <i class="cuIcon-likefill" />
              {{ postItem.SimilarPagePv.LikePv | englishNumber }}
            </div>
            <div class="cu-tag sm line-black radius">
              <i class="cuIcon-like" />
              {{ postItem.SimilarPagePv.UnLikePv | englishNumber }}
            </div>
            <div class="cu-tag sm line-purple radius">
              <i class="cuIcon-comment" />
              {{ postItem.SimilarPagePv.ReadCommentPv | shortNumber }}
            </div>
            <div class="cu-tag sm line-pink radius">
              <i class="cuIcon-share" />
              {{ postItem.SimilarPagePv.SharePv | shortNumber }}
            </div>
            <div class="cu-tag sm line-pink radius">
              <i class="cuIcon-time" />
              {{ postItem.SimilarPagePv.ReadTime | shortTime }}
            </div>
            <div class="cu-tag sm line-purple radius">
              <i class="cuIcon-timefill" />
              <i class="cuIcon-profile" />
              {{ postItem.SimilarPagePv.ReadAvgTime | shortTime }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="!listLoading && !list.length" style="height: 20em" class="flex align-center justify-center text-grey">
      Empty
    </div>
    <div v-show="list.length && atTail" class="margin-top-lg padding-tb text-center text-grey">The above is all</div>
    <el-backtop target=".app-main" />
    <h5-view :src="H5Src" :visible.sync="H5DrawerShow" />
    <el-drawer :visible.sync="rawVisible" append-to-body size="600px">
      <el-tabs v-model="rawTab" type="border" class="padding-lr-sm">
        <el-tab-pane name="user" label="User">
          <pre>{{ JSON.stringify(user, null, 2) }}</pre>
          <div>TimezoneOffset {{ timezoneOffset }}</div>
        </el-tab-pane>
        <el-tab-pane name="record" label="Record">
          <pre>{{ JSON.stringify(readLogMap, null, 2) }}</pre>
        </el-tab-pane>
        <el-tab-pane name="article" label="Article">
          <el-input v-model.number="editId" size="small">
            <span slot="prepend">ID</span>
          </el-input>
          <pre v-if="editId">{{ JSON.stringify(docList.filter(({ id }) => id === editId), null, 2) }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>
<script>
import {
  contentStyleMap
} from '@/settings'
import {
  getNewsList,
  getUserBehaviorTimeList,
  getUserRequestLogList,
  getUserFeature,
  getUserInfo,
  getDocsFeature,
  getDocsData,
  reasonMap
} from '@/api/recommend'
import {
  mapRouteGetters,
  toDate,
  dateFormat,
  debounce,
  dateMutate,
  timestampBeginOfDay,
  getGTMTimezoneOffset
} from '@/utils'
import H5View from '@/components/H5View'
import Loading from '@/components/Loading/default.vue'
import GroupList from './groupList'

const positionColor = [
  'bg-black',
  'bg-red',
  'bg-mauve',
  'bg-orange',
  'bg-brown',
  'bg-purple',
  'bg-green',
  'bg-cyan',
  'bg-yellow',
  'bg-olive',
  'bg-blue',
  'bg-pink'
]

const sourceMap = {
  1: 'Self',
  2: 'PGC',
  3: 'Spider',
  4: 'PostNow'
}

const emptyPostData = {
  ctr: 0,
  ReadTime: 0,
  ReadAvgTime: 0,
  ShowPv: 0,
  ValidShow: 0,
  ReadPv: 0,
  ValidRead: 0,
  ReadLong: 0,
  WatchLong: 0,
  ReadCommentPv: 0,
  SharePv: 0,
  LikePv: 0,
  UnLikePv: 0
}

const articleStateTypes = [
  { text: 'All', value: '' },
  { text: 'Impression', value: 'impTime' },
  { text: 'ValidImpression', value: 'impValidTime' },
  { text: 'Click', value: 'clickTime' },
  { text: 'ValidClick', value: 'clickValidTime' },
  { text: 'ReadComment', value: 'readCommentTime' },
  { text: 'Comment', value: 'commentTime' },
  { text: 'Like', value: 'likeTime' },
  { text: 'Unlike', value: 'unlikeTime' },
  { text: 'Share', value: 'shareTime' },
  { text: 'Watching', value: 'watchingTimeTime' },
  { text: 'Reading', value: 'readingTimeTime' },
  { text: 'ReadPercent', value: 'readPercentTime' },
  { text: 'ReadFinish', value: 'readFinishTime' }
]

const articleStateTypesDuration = articleStateTypes.slice(1).map(({ value }) => value.replace(/Time$/, 'Duration'))

const sceneTypes = [
  { label: 'All', value: '-1' },
  { label: 'ForYou', value: '0', disable: true },
  { label: 'Relate', value: '1', disable: true },
  { label: 'VideoDark', value: '2', disable: true },
  { label: 'Channel', value: '3', disable: true },
  { label: 'Video', value: '4', disable: true },
  { label: 'VideoCategory', value: '5', disable: true },
  { label: 'Moment', value: '6', disable: true },
  { label: 'External', value: '7', disable: true },
  { label: 'NewApp', value: '8', disable: true },
  { label: 'Offline', value: '9', disable: true },
  { label: 'ChannelQuiz', value: '10', disable: true },
  { label: 'VideoDarkRelate', value: '11', disable: true },
  { label: 'AiVoice', value: '12', disable: true },
  { label: 'AiVoiceCat', value: '13', disable: true }
]
const emptyUser = {
  Country: '',
  Language: '',
  PackageName: '',
  ClientVersionCode: '',
  ClientVersionName: '',
  DeviceInfo: '',
  TimeZone: '',
  NetworkType: '',
  FrstOpenTime: 0,
  Ip: '',
  Cats: '',
  RCat2: '',
  aliveDay: 0,
  gender: 0,
  birthday: '',
  SystemLanguage: ''
}
const sceneTypeMap = Object.fromEntries(sceneTypes.map(s => [s.value, s.label]))
const docDetailCache = {}
const docDataCache = {}
const docFeatureCache = {}

export default {
  name: 'RecommendList',
  components: { H5View, GroupList, Loading },
  data() {
    this.articleStateTypes = articleStateTypes
    this.reasonMap = reasonMap
    this.sceneTypeMap = sceneTypeMap
    this.contentStyleMap = contentStyleMap
    this.positionColor = positionColor
    this.docList = []
    this.showList = []
    return {
      idField: 'newsId',
      characterTab: 'user',
      rawTab: 'user',
      dayTimestamp: -1,
      dayTimestampList: [],
      timezoneOffset: 0,
      H5Src: null,
      H5DrawerShow: false,
      editId: null,
      rawVisible: false,
      keyword: null,
      list: [],
      total: 0,
      atTail: false,
      listLoading: false,
      date: undefined,
      sceneTypes,
      scene: sceneTypes[0].value,
      astType: '',
      docResource: 0,
      timeDirection: -1,
      user: {
        Country: '',
        Language: '',
        PackageName: '',
        ClientVersionCode: '',
        ClientVersionName: '',
        DeviceInfo: '',
        TimeZone: '',
        NetworkType: '',
        FrstOpenTime: 0,
        Ip: '',
        Cats: '',
        RCat2: '',
        aliveDay: 0,
        gender: 0,
        birthday: '',
        SystemLanguage: ''
      },
      readLogMap: null,
      lastUid: '',
      listQuery: {
        pageSize: 20,
        page: 1,
        ...mapRouteGetters(this.$route.query, {
          uid: String,
          type: String
        })
      },
      analiseDocResource: {},
      analiseData: {
        all: [],
        date: [],
        language: [],
        recallId: [],
        scene: [],
        packageName: [],
        clientVersionName: [],
        appSource: [],
        networkType: [],
        strategy: [],
        deviceInfo: []
      }
    }
  },
  computed: {
    remoteQuery() {
      return {
        page: 1,
        uid: this.listQuery.uid.toLowerCase(),
        type: this.listQuery.type
      }
    },
    validSceneTypes() {
      return this.sceneTypes.filter(s => !s.disable)
    },
    currentFilterAnaliseData() {
      return this.analiseData.all[0] || {}
    },
    projectType() {
      return this.$store.getters.projectType
    }
  },
  watch: {
    scene() {
      this.filterList()
    },
    dayTimestamp() {
      this.filterList()
    },
    astType() {
      this.filterList()
    },
    docResource() {
      this.filterList()
    },
    timeDirection() {
      this.filterList()
    },
    keyword: debounce(function() {
      this.filterList()
    }, 300)
  },
  created() {
    this.pullData()
  },
  beforeRouteUpdate(to, from, next) {
    this.listQuery.uid = to.query.uid
    this.listQuery.type = to.query.type
    this.pullData()
    next()
  },
  mounted() {
    this.appWrapper = document.querySelector('.app-main')
    this.appWrapper.addEventListener('scroll', this.showMoreReadList)
  },
  beforeDestroy() {
    this.appWrapper.removeEventListener('scroll', this.showMoreReadList)
    this.appWrapper = null
  },
  methods: {
    dateMutate,
    showMoreReadList: debounce(function() {
      if (!this.listLoading && this.total && this.appWrapper.scrollHeight - this.appWrapper.scrollTop
          < this.appWrapper.offsetHeight * 1.8) {
        this.listQuery.page += 1
        this.pullList()
      }
    }, 100),
    getOpenTimeDistance(timestamp) {
      return Math.ceil((timestamp - toDate(this.user.FrstOpenTime).getTime()) / 1000 / 3600 / 24)
    },
    async pullData() {
      const uid = this.remoteQuery.uid
      const type = this.remoteQuery.type
      if (!uid) {
        return false
      }
      this.listLoading = true
      const isNewUser = this.lastUid !== uid
      this.lastUid = uid
      if (isNewUser) {
        this.$router.replace({ query: { uid, type }})
      }
      const [docList, readLogMap] = await Promise.all([
        getUserRequestLogList({ uid: this.remoteQuery.uid, type: this.remoteQuery.type }).catch(err => Promise.reject('RequestLog ' + err)),
        getUserBehaviorTimeList({ uid: this.remoteQuery.uid, type: this.remoteQuery.type }).then(list => (this.readLogMap = list)).catch(err => Promise.reject('BehaviorTime ' + err)),
        isNewUser && getUserFeature({ uid: this.remoteQuery.uid }).then(user => {
          Object.assign(this.user, emptyUser, user)
          this.user.aliveDay = this.getOpenTimeDistance(Date.now())
          this.timezoneOffset = this.user.TimeZone ? getGTMTimezoneOffset(this.user.TimeZone) : 0
        }).catch(err => Promise.reject('UserFeature ' + err)),
        isNewUser && getUserInfo({ uid: this.remoteQuery.uid }).then(data => {
          Object.assign(this.user, data)
        }).catch(err => Promise.reject('UserInfo ' + err))
      ]).catch(err => {
        this.$message.error('Network Error When Pulling Data: ' + err)
        this.listLoading = false
        return Promise.reject('Pull Data Error: ' + err)
      })
      console.log('docList', JSON.parse(JSON.stringify(docList)))
      docList.forEach(doc => {
        doc.docResource = 0
        const behaviorObject = readLogMap[doc.id + doc.requestId]
        if (behaviorObject) {
          Object.assign(doc, behaviorObject)
          doc.docResource |= behaviorObject.duplicate ? 2 : 0
        }
      })
      Object.entries(docList.reduce((group, row) => {
        group[row.id] = (group[row.id] || 0) + 1
        return group
      }, {}))
        .filter(([key, value]) => value > 1)
        .forEach(([key]) => {
          docList.filter(({ id }) => +key === id).forEach(doc => {
            doc.docResource = (doc.docResource || 0) | 4
          })
        })
      this.docList = docList.map(doc => {
        doc.timestamp = doc.requestTimestamp || doc.recordTimestamp
        doc.date = dateFormat(doc.timestamp, 'Y-M-D', this.timezoneOffset)
        return doc
      })
      this.total = this.docList.length
      this.listLoading = false
      return this.filterList()
    },
    async filterList() {
      const showList = this.docList.filter(row => {
        return (this.docResource === 0 || (this.docResource < -1 && (-this.docResource & row.docResource)
                === -this.docResource || !!(this.docResource & row.docResource)))
               && (!this.keyword || +this.keyword === row.id || this.keyword === row.author)
               && (this.astType === articleStateTypes[0].value || row[this.astType])
      }).sort((a, b) => (this.docResource === 4 && !!(a.id - b.id) ? a.id - b.id : a.timestamp - b.timestamp)
                        * this.timeDirection)
      this.dayTimestampList = []
      this.sceneTypes.slice(1).forEach(item => {
        item.disable = true
      })
      showList.forEach(doc => {
        const day = timestampBeginOfDay(doc.timestamp)
        if (!this.dayTimestampList.includes(day)) {
          this.dayTimestampList.push(day)
        }
        const sceneItem = this.sceneTypes.find(s => s.value === doc.scene) || {}
        sceneItem.disable = false
      })
      this.dayTimestampList.sort((a, b) => b - a)

      const fromTimestamp = this.dayTimestamp > -1 ? this.dayTimestamp - 1 : 0
      const toTimestamp = this.dayTimestamp > -1 ? this.dayTimestamp + 86400000 : 1e13
      this.showList = showList.filter(row => {
        return (this.scene === sceneTypes[0].value || this.scene === row.scene)
               && row.timestamp > fromTimestamp && row.timestamp < toTimestamp
      })

      this.analiseDocResource = {
        0: this.showList.length,
        1: 0,
        2: 0,
        4: 0,
        8: 0,
        16: 0
      }
      this.showList.forEach(doc => {
        // mark resource
        this.analiseDocResource[1] += !(doc.docResource & 1) ? 0 : 1
        this.analiseDocResource[2] += !(doc.docResource & 2) ? 0 : 1
        this.analiseDocResource[4] += !(doc.docResource & 4) ? 0 : 1
        this.analiseDocResource[8] += !(doc.docResource & 8) ? 0 : 1
        this.analiseDocResource[16] += !(doc.docResource & 16) ? 0 : 1
      })
      const filterList = this.docList.filter(row => {
        return (this.scene === sceneTypes[0].value || this.scene === row.scene)
               && row.timestamp > fromTimestamp && row.timestamp < toTimestamp
               && row.requestIndex > -1
      }).sort((a, b) => (a.timestamp - b.timestamp) * this.timeDirection)
      let currentRequestIndex
      let currentSceneIndex = this.timeDirection === -1 ? [...new Set(filterList.map(row => row.requestIndex))].length
                                                          + 1 : 0
      console.log('filterList', filterList)
      filterList.forEach((doc, index) => {
        if (doc.requestIndex !== currentRequestIndex) {
          currentSceneIndex += this.timeDirection
          currentRequestIndex = doc.requestIndex
        }
        doc.sceneIndex = currentSceneIndex
        doc.positionStr = [doc.sceneIndex, doc.position + 1].join('-')
      })
      this.listQuery.page = 1
      this.list = []
      Object.keys(this.analiseData).forEach(key => this.analiseGroup(key))
      this.pullList()
    },
    async pullList(state) {
      console.log('pullList')
      this.listLoading = state !== false
      const listBase = this.list
      const list = this.showList.slice(this.listQuery.pageSize * this.listQuery.page - this.listQuery.pageSize,
        this.listQuery.pageSize * this.listQuery.page)
      const needNewsList = list.filter(row => !docDetailCache[row.id]).map(row => row.id)
      const needDocsDataList = list.filter(row => !docDataCache[row.id]).map(row => row.id)
      const needDocsList = list.filter(row => !docFeatureCache[row.id]).map(row => row.id)
      await Promise.all([
        getNewsList(needNewsList, this.listQuery.type).then(list => {
          list.forEach(row => {
            docDetailCache[row.id] = row
          })
        }, () => Promise.resolve(this.$notify.error('Error When Pulling News List'))),
        getDocsData(needDocsDataList, this.listQuery.type).then(list => {
          list.forEach(row => {
            docDataCache[row.id] = row
          })
        }, () => Promise.resolve(this.$notify.error('Error When Pulling Doc Data'))),
        getDocsFeature(needDocsList, this.listQuery.type).then(list => {
          list.forEach(row => {
            docFeatureCache[row.id] = row
          })
        }, () => Promise.resolve(this.$notify.error('Error When Pulling Doc Feature')))
      ])
      if (listBase !== this.list) {
        return
      }
      this.list = listBase.concat(list.map(this.decorationRow))
      this.atTail = !list.length
      this.listLoading = false
      if (!needNewsList.length && !needDocsList.length && !this.atTail) {
        return new Promise(r => {
          window.requestAnimationFrame(async() => {
            this.listQuery.page += 1
            await this.pullList(false)
            r()
          })
        })
      }
    },
    analiseGroup(groupField) {
      this.analiseData[groupField] = Object.values(this.showList.reduce((group, row) => {
        const item = group[row[groupField]] = group[row[groupField]] || {
          group: row[groupField] || '(' + groupField + ')',
          count: 0
        }
        item.count += 1
        articleStateTypes.slice(1).forEach(({ value: rowField }) => {
          item[rowField] = (item[rowField] || 0) + (row[rowField] ? 1 : 0)
        })
        articleStateTypesDuration.forEach((rowField) => {
          item[rowField] = (item[rowField] || 0) + (row[rowField] || 0)
        })
        return group
      }, {})).sort((a, b) => b.group - a.group)
    },
    decorationRow(row) {
      Object.assign(row, docDataCache[row.id] || {}, docFeatureCache[row.id] || {}, docDetailCache[row.id] || {})
      row.publishTimeStr = dateFormat(row.publish_time, 'M-D H:N', this.timezoneOffset)
      row.contentStyleName = contentStyleMap[row.content_style] || row.content_style
      row.sourceName = sourceMap[row.source_type] || row.source_type
      row.sceneName = sceneTypeMap[row.scene] || row.scene
      row.recordTimeDateStr = dateFormat(row.timestamp, 'Y-M-D', this.timezoneOffset)
      row.recordTimeStr = dateFormat(row.timestamp, 'H:N', this.timezoneOffset)
      row.RecPagePv = Object.assign({}, emptyPostData, row.RecPagePv || {})
      row.SimilarPagePv = Object.assign({}, emptyPostData, row.SimilarPagePv || {})
      return row
    },
    imageLoadError(row) {
      row.docResource |= 8
      this.analiseDocResource[8] += 1
    },
    viewArticleRaw(row) {
      const w = window.open('about:blank')
      w.document.title = this.remoteQuery.uid + ' ' + row.id
      w.document.body.innerHTML
        = '<pre>'
          + JSON.stringify(this.docList.filter(({ id }) => id === row.id), null, 2)
          + '</pre>'
    },
    viewJoga(row) {
      this.viewInMobile([
        'https://m.scoopernews.com',
        '/joga/share',
        '?itemId=',
        row.id
      ].join(''), row.title)
    },
    viewPost(row) {
      this.viewInMobile([
        'https://m.scoopernews.com',
        '/detail',
        '?newsId=',
        row.id
      ].join(''), row.title)
    },
    viewPostCDN(row) {
      this.viewInMobile([
        'https://cdn.scooper.news/static/half/detail/',
        ((+row.id / 5000) | 0) + 1,
        '/',
        row.id,
        row.content_style !== 1 ? '.json' : '.html'
      ].join(''), row.title)
    },
    viewPostPHX(row) {
      this.viewInMobile([
        'https://phx.scooper.news/phx/article?docId=',
        row.id
      ].join(''), row.title)
    },
    viewInMobile(src, title) {
      const w = window.open('about:blank')
      w.document.title = title
      w.document.body.innerHTML = '<div><a href="' + src + '" rel="noreferrer" target="_self">' + src
                                  + '</a></div><iframe rel="noreferrer" style="width: 360px; height: 90vh; border: 2px solid gray; border-radius: 0.5em;" src="'
                                  + src + '" />'
    }
  }
}
</script>
<style>
.data-fixed-width.text-left .cu-tag {
  justify-content: flex-start;
}

.data-fixed-width span {
  width: 5.5em;
  margin-bottom: 2px;
}

.data-fixed-width span:first-child {
  width: 6em;
}

.recommend .cu-tag *[class*="cuIcon-"] {
  margin-right: 0.2em;
}

</style>
