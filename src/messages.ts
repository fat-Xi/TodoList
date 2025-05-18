import { ElMessage } from 'element-plus'

export const loginSuccess = () => {
  ElMessage({
    message: '登录成功',
    type: 'success',
  })
}
export const loginError = () => {
  ElMessage({
    message: '账号密码错误',
    type: 'warning',
  })
}
export const loginFail = () => {
  ElMessage({
    message: '登录失败',
    type: 'warning',
  })
}
export const registerSuccess = () => {
  ElMessage({
    message: '注册成功',
    type: 'success',
  })
}
export const registerFail = () => {
  ElMessage({
    message: '注册失败',
    type: 'warning',
  })
}
export const logoutSuccess = () => {
  ElMessage({
    message: '退出成功',
    type: 'success',
  })
}
export const logoutFail = () => {
  ElMessage({
    message: '退出失败',
    type: 'warning',
  })
}
export const changeSuccess = () => {
  ElMessage({
    message: '修改成功',
    type: 'success',
  })
}
export const changeFail = () => {
  ElMessage({
    message: '修改失败',
    type: 'warning',
  })
}
export const doneSuccess = () => {
  ElMessage({
    message: '你已完成此代办',
    type: 'success',
  })
}
