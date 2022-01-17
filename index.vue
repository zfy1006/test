<template>
  <div>
    <nav-bar />
    <div class="flex justify-center">
      <div class="text-center margin-tb-lg margin-right">
        <el-select v-model="listQuery.type" placeholder="Project Type" class="margin-right" style="width: 106px">
          <el-option v-for="t in projectType" :key="t.value" :label="t.name" :value="t.value" />
        </el-select>
        <el-input v-model.trim="listQuery.uid" style="width: 300px" size="large" type="text" placeholder="Search DPID" @keypress.native.enter="toRecommend">
          <span slot="prepend">DPID</span>
        </el-input>
        <div class="pointer radius-lg padding border-solid line-brown text-lg margin-top-sm" @click="toRecommend">
          <i class="cuIcon-present margin-right-xs" />
          Recommend Engine
        </div>
      </div>
      <div v-if="roleFresh" class="text-center margin-tb-lg">
        <el-date-picker v-model="listQuery.date" value-format="yyyy-MM-dd" style="width: 300px" type="date" />
        <div class="pointer radius-lg padding border-solid line-green text-lg margin-top-sm" @click="toFresh">
          <i class="cuIcon-search margin-right-xs" />
          Fresher Trend
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar'
import { mapRouteGetters } from '@/utils'

export default {
  name: 'Dashboard',
  components: { NavBar },
  data() {
    return {
      listQuery: {
        ...mapRouteGetters(this.$route.query, {
          uid: String,
          date: String,
          type: {
            type: String,
            default: '1'
          }
        })
      }
    }
  },
  computed: {
    roles() {
      return this.$store.getters.roles
    },
    roleFresh() {
      return this.roles.includes('fresh')
    },
    projectType() {
      return this.$store.getters.projectType
    }
  },
  methods: {
    toRecommend() {
      this.$router.push({
        path: '/recommend/list',
        query: this.listQuery
      })
    },
    toFresh() {
      this.$router.push({
        path: '/fresh/list',
        query: this.listQuery
      })
    },
    toSearch() {
      this.$router.push({
        path: '/search/list',
        query: this.listQuery
      })
    }
  }
}
</script>
