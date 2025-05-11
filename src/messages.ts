import { ElMessage } from 'element-plus'

export const loginsuccess = () => {
  ElMessage({
    message: '登录成功',
    type: 'success',
  })
}
export const loginerror = () => {
  ElMessage({
    message: '账号密码错误',
    type: 'warning',
  })
}
export const loginfail = () => {
  ElMessage({
    message: '登录失败',
    type: 'warning',
  })
}
export const registersuccess = () => {
  ElMessage({
    message: '注册成功',
    type: 'success',
  })
}
export const registerfail = () => {
  ElMessage({
    message: '注册失败',
    type: 'warning',
  })
}
export const logoutsuccess = () => {
  ElMessage({
    message: '退出成功',
    type: 'success',
  })
}
export const logoutfail = () => {
  ElMessage({
    message: '退出失败',
    type: 'warning',
  })
}
export const changesuccess = () => {
  ElMessage({
    message: '修改成功',
    type: 'success',
  })
}
export const changefail = () => {
  ElMessage({
    message: '修改失败',
    type: 'warning',
  })
}
export const donesuccess = () => {
  ElMessage({
    message: '你已完成此代办',
    type: 'success',
  })
}
