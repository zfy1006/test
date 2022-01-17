const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  device: state => state.app.device,
  direction: state => state.app.direction,
  clientSize: state => state.app.clientSize,
  version: state => state.settings.version,
  flag: state => state.settings._flag,
  apiPath: state => state.settings.apiPath,
  mediaList: state => state.settings.mediaList,
  timestamp: state => state.timestamp,
  query: state => state.query,
  token: state => state.token,
  userInfo: state => state.user.userInfo,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  projectType: state => state.app.projectType
}
export default getters
