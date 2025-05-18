<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import localforage from 'localforage'
import { doneSuccess } from '@/messages.ts'

const timeLists = ref<StartTime[]>([])
const groupedTimelists = ref<{ [date: string]: TodoItem[] }>({})
const formLabelWidth = '140px'     //待修改
const addForm = ref(null)
const dialogFormVisible = ref(false)
const dialogVisible = ref(false)
const deleteContent = ref()
const deleteStartTime = ref()

// 定义 todo 项的接口
interface TodoItem {
  todoHead: string;
  todoContent: string;
  todoDdl: string;
  todoStartTime: string;
  todoDoneTime: string;
}
// 定义开始时间列表数据接口
interface StartTime {
  startTime: string;
  itemList: TodoItem[]
}
// 定义完成时间列表数据接口
interface DoneTime {
  doneTime: string;
  itemList: TodoItem[]
}
// 定义用户数据接口
interface UserData {
  password: string;
  avatar: string;
  name: string;
  todoList: StartTime[];
  doneList: DoneTime[];
}

//表单数据
const form = ref({
  todoHead: '',
  todoContent: '',
  todoStartTime: '',
  todoDdl: ''
})

// 检验规则
const validDdl = (rule, value, callback) => {
  const startDate = form.value.todoStartTime;
  const start = new Date(startDate);
  const end = new Date(value);
  const now = new Date()
  if (startDate && value) {
    if (end < start) {
      callback('截止日期必须大于开始日期');
    }
    else if (end < now) {
      callback('截止日期必须大于当前日期')
    }
    else {
      callback()
    }
  }
  else {
    callback()
  }
}
const rule1 = {
  todoHead: [
    { required: true, message: "主题不能为空", trigger: "blur" },
    { min: 1, max: 8, message: "长度为<=8位", trigger: "blur" }
  ],
  todoContent: [{ required: true, message: "内容不能为空", trigger: "blur" }],
  todoStartTime: [{ required: true, message: "日期不能为空", trigger: "blur" }],
  todoDdl: [{ required: true, message: "日期不能为空", trigger: "blur" },
  { validator: validDdl, trigger: 'blur' }
  ],
}

// 点击+号函数
const Add = () => {
  dialogFormVisible.value = true
}

// 添加代办函数
const addList = async () => {
  const addFormValid = await addForm.value.validate();
  if (addFormValid) {
    const { todoHead, todoContent, todoStartTime, todoDdl } = form.value;
    try {
      const userNumber = await localforage.getItem('user') as string;
      if (userNumber) {
        const oldData = await localforage.getItem(userNumber) as UserData;
        // 格式化开始日期和截止日期
        const formattedStartDate = formatDate(todoStartTime);
        const formattedDdl = formatDate(todoDdl);
        // 创建新的代办事项，使用格式化后的日期
        const newTodo: TodoItem = {
          todoHead:todoHead,
          todoContent:todoContent,
          todoDdl: formattedDdl,
          todoStartTime: formattedStartDate,
          todoDoneTime: ''
        };
        // 查找是否已存在该日期的分组，使用格式化后的日期进行比较
        const startTimeIndex = oldData.todoList.findIndex(
          item => formatDate(item.startTime) === formattedStartDate
        );
        if (startTimeIndex === -1) {
          // 如果不存在，创建新的日期分组
          oldData.todoList.push({
            startTime: formattedStartDate,
            itemList: [newTodo]
          });
        } else {
          // 如果存在，添加到现有分组
          oldData.todoList[startTimeIndex].itemList.push(newTodo);
        }
        console.log('时间线', startTimeIndex)
        await localforage.setItem(userNumber, {
          password: oldData.password,
          name: oldData.name,
          avatar: oldData.avatar,
          todoList: oldData.todoList,
          doneList: oldData.doneList
        });
        console.log('添加待办成功');
        await getList(); // 重新获取数据以更新分组
      }
    } catch (error) {
      console.log('添加代办错误', error);
      alert('添加代办错误');
    }
  }
  dialogFormVisible.value = false;
  Cancel();
};

// 删除代办
const toDelete = (todoContent: string, todoStartTime: string) => {
  deleteContent.value = todoContent
  deleteStartTime.value = todoStartTime
  dialogVisible.value = true
}
const deleteList = async () => {
  const content = deleteContent.value;
  const startTime = deleteStartTime.value;
  try {
    const userNumber = await localforage.getItem('user') as string;
    if (userNumber) {
      const oldData = await localforage.getItem(userNumber) as UserData;
      // 格式化要删除待办的开始日期
      const formattedStarttime = formatDate(startTime);
      // 查找对应的时间分组，使用格式化后的日期进行比较
      const startTimeIndex = oldData.todoList.findIndex(
        item => formatDate(item.startTime) === formattedStarttime
      );
      if (startTimeIndex !== -1) {
        const itemIndex = oldData.todoList[startTimeIndex].itemList.findIndex(
          item => item.todoContent === content
        );
        if (itemIndex !== -1) {
          oldData.todoList[startTimeIndex].itemList.splice(itemIndex, 1);
          if (oldData.todoList[startTimeIndex].itemList.length === 0) {
            oldData.todoList.splice(startTimeIndex, 1);
          }
          await localforage.setItem(userNumber, {
            password: oldData.password,
            name: oldData.name,
            avatar: oldData.avatar,
            todoList: oldData.todoList,
            doneList: oldData.doneList
          });
          console.log('删除成功');
          await getList();
        }
      }
    }
  } catch (error) {
    console.log('删除代办错误', error);
  }
  dialogVisible.value = false;
};

// 完成代办
const Done = async (todoContent: string, todoStartTime: string) => {
  try {
    const userNumber = await localforage.getItem('user') as string;
    if (userNumber) {
      const oldData = await localforage.getItem(userNumber) as UserData;
      // 格式化要完成待办的开始日期
      const formattedStarttime = formatDate(todoStartTime);
      // 查找对应的时间分组，使用格式化后的日期进行比较
      const startTimeIndex = oldData.todoList.findIndex(
        item => formatDate(item.startTime) === formattedStarttime
      );
      console.log('starttimeindex:', startTimeIndex);
      if (startTimeIndex !== -1) {
        const itemIndex = oldData.todoList[startTimeIndex].itemList.findIndex(
          item => item.todoContent === todoContent
        );
        if (itemIndex !== -1) {
          const completedTodo = oldData.todoList[startTimeIndex].itemList[itemIndex];
          completedTodo.todoDoneTime = new Date().toISOString();
          const doneTime = formatDate(completedTodo.todoDoneTime);
          const doneTimeIndex = oldData.doneList.findIndex(
            item => formatDate(item.doneTime) === doneTime
          );
          if (doneTimeIndex === -1) {
            oldData.doneList.push({
              doneTime: doneTime,
              itemList: [completedTodo]
            });
          } else {
            oldData.doneList[doneTimeIndex].itemList.push(completedTodo);
          }
          oldData.todoList[startTimeIndex].itemList.splice(itemIndex, 1);
          if (oldData.todoList[startTimeIndex].itemList.length === 0) {
            oldData.todoList.splice(startTimeIndex, 1);
          }
          await localforage.setItem(userNumber, {
            password: oldData.password,
            name: oldData.name,
            avatar: oldData.avatar,
            todoList: oldData.todoList,
            doneList: oldData.doneList
          });
          console.log('待办已标记为完成');
          doneSuccess()
          await getList();
        }
      }
    }
  } catch (error) {
    console.log('完成待办错误', error);
  }
};

// 获取数据
const getList = async () => {
  const userNumber = await localforage.getItem('user') as string;
  console.log('用户账号', userNumber);
  if (userNumber) {
    document.querySelector('.add')?.classList.remove('none');
    try {
      const userData = await localforage.getItem(userNumber) as UserData;
      if (userData) {
        timeLists.value = userData.todoList.map((startTime) => ({
          startTime: startTime.startTime,
          itemList: startTime.itemList
        }));
        timeLists.value.sort((a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        const grouped: { [date: string]: TodoItem[] } = {};
        timeLists.value.forEach((timeList) => {
          timeList.itemList.forEach((item) => {
            const date = formatDate(item.todoStartTime);
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(item);
          });
        });
        groupedTimelists.value = grouped;
        console.log("读取成功", groupedTimelists.value);
      }
    } catch (error) {
      console.log("读取错误", error);
    }
  } else {
    document.querySelector('.add')?.classList.add('none');
  }
};

// 清空数据
const Cancel = () => {
  form.value.todoHead = ''
  form.value.todoDdl = ''
  form.value.todoContent = ''
  form.value.todoStartTime = ''
  dialogFormVisible.value = false
}

// 提取日期函数
const getDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // 使用 toLocaleDateString 方法并指定日期格式
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

// 格式化日期函数
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  getList()
})
</script>

<template>
  <button class="add" @click="Add"></button>
  <div class="custom-timeline">
    <div class="custom-timeline-item" v-for="(groupedItems, date) in groupedTimelists" :key="date">
      <div class="timestamp"> --- {{ formatDate(date) }} --- </div>
      <div class="todo-container">
        <div class="todocard" v-for="(item, itemIndex) in groupedItems" :key="itemIndex">
          <div class="cardhead">
            <h2>--{{ item.todoHead }}--</h2>
            <button @click="toDelete(item.todoContent, item.todoStartTime)"></button>
          </div>
          <hr>
          <div class="content">{{ item.todoContent }}</div>
          <hr>
          <div class="cardfoot">
            <h4>Deadline: {{ formatDate(getDateOnly(item.todoDdl)) }}</h4>
            <button @click="Done(item.todoContent, item.todoStartTime)">Done</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 增加list -->
  <el-dialog v-model="dialogFormVisible" title="增加代办：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule1" ref="addForm">
      <el-form-item label="主题:" :label-width="formLabelWidth" prop="todoHead">
        <el-input v-model="form.todoHead" autocomplete="off" placeholder="请输入主题" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="正文:" :label-width="formLabelWidth" prop="todoContent">
        <el-input v-model="form.todoContent" maxlength="30" style="width: 300px;" placeholder="请输入正文内容" show-word-limit
          type="textarea" />
      </el-form-item>
      <el-form-item label="开始日期:" :label-width="formLabelWidth" prop="todoStarTtime">
        <el-date-picker v-model="form.todoStartTime" type="date" placeholder="请选择开始日期" />
      </el-form-item>
      <el-form-item label="截止日期:" :label-width="formLabelWidth" prop="todoDdl">
        <el-date-picker v-model="form.todoDdl" type="date" placeholder="请选择截止时间" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="Cancel">取消</el-button>
        <el-button type="primary" @click="addList">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 删除确认 -->
  <el-dialog v-model="dialogVisible" title="确定删除这个代办？" width="500" top="32vh">
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteList">
          删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<style scoped>
@font-face {
  font-family: 'icomoon';
  src: url('fonts/icomoon.eot?nlie2y');
  src: url('fonts/icomoon.eot?nlie2y#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?nlie2y') format('truetype'),
    url('fonts/icomoon.woff?nlie2y') format('woff'),
    url('fonts/icomoon.svg?nlie2y#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.custom-timeline-item {
  margin-bottom: 50px;
}

.timestamp {
  font-size: 28px;
  font-weight: 700;
  color: rgb(100, 145, 240);
  margin-bottom: 20px;
  display: block;
  font-family: 'icomoon';
}

.todo-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 30px 0 0 30px;
  border-radius: 20px;
  background-color: white;
}

.todocard {
  height: 250px;
  width: 325px;
  margin-right: 27px;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 20px;
  background-color: rgb(130, 165, 245);
}

.todocard .cardhead {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cardhead h2 {
  letter-spacing: 0.08em;
  color: white;
}

.cardhead button {
  width: 25px;
  height: 25px;
  margin-top: 5px;
  margin-right: 5px;
  border: 1.5px solid white;
  border-radius: 25px;
  font-size: 20px;
  background-color: transparent;
  color: white;
  font-family: 'icomoon';
}

.cardhead button:hover {
  border: 2px solid white;
}

.content {
  height: 150px;
  margin: 10px 0 10px 0;
  font-size: 20px;
  color: white;
  word-wrap: break-word;
}

.todocard .cardfoot {
  display: flex;
  justify-content: space-between;
  color: white;
}

.cardfoot h4 {
  margin-top: 12px;
}

.cardfoot button {
  width: 65px;
  height: 32px;
  margin-top: 8px;
  font-size: 14px;
  border: 1.5px solid white;
  border-radius: 10px;
  background-color: transparent;
  color: white;
  font-weight: 500;
}

.cardfoot button:hover {
  border: 2px solid white;
}

.add {
  position: fixed;
  bottom: 65px;
  right: 65px;
  width: 80px;
  height: 80px;
  border-radius: 80px;
  border: 3px solid rgb(100, 145, 240);
  font-size: 20px;
  color: rgb(100, 145, 240);
  font-family: 'icomoon';
}

.add:hover {
  border: 4px solid rgb(100, 145, 240);
}

.none {
  display: none;
}
</style>
