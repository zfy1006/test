import Cookies from 'js-cookie'
import setting from './settings'
import { getLanguage } from '../../lang/index'

const state = {
  sidebar: {
    opened: !!setting.state._flag.sidebarOpened,
    withoutAnimation: false
  },
  language: getLanguage(),
  device: 'mobile',
  direction: 'ltr',
  clientSize: {
    height: 0,
    width: 0
  },
  isCollapse: false,
  projectType: [{
    name: 'Scooper',
    value: '1'
  },
  {
    name: 'Joga',
    value: '2'
  },
  {
    name: 'Meow',
    value: '3'
  }]
}
const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language
    Cookies.set('language', language)
  },
  SET_DIRECTION: (state, direction) => {
    state.direction = direction
  },
  UPDATE_CLIENT_SIZE: (state, size) => {
    Object.assign(state.clientSize, size)
  },
  SET_COLLAPSE: (state, collapse) => {
    state.isCollapse = !state.isCollapse
  }

}
const actions = {
  toggleSideBar({ commit, dispatch, state }) {
    commit('TOGGLE_SIDEBAR')
    dispatch('settings/changeFlag', {
      sidebarOpened: state.sidebar.opened
    }, { root: true })
  },
  closeSideBar({ commit, dispatch, state }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
    dispatch('settings/changeFlag', {
      sidebarOpened: state.sidebar.opened
    }, { root: true })
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  updateClientSize({ commit }, size) {
    commit('UPDATE_CLIENT_SIZE', size)
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
  },
  setCollapse({ commit }, collapse) {
    commit(('SET_COLLAPSE'), collapse)
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
