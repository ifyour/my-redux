/**
 * 原生 redux 用法: createStore subscribe dispatch
 */
import { createStore } from 'redux'
const ADD = 'ADD';
const LESS = 'LESS';

// 创建 reducer
function counter(state = 10, action) {
  switch (action.type) {
    case ADD:
      return state + 1
    case LESS:
      return state - 1
    default:
      return state
  }
}

// 创建 action create
const add = () =>({ type: ADD  });
const less = () =>({ type: LESS  });

// 创建 store
const store = createStore(counter)

// 获取默认状态
const init = store.getState()
console.log(`Init count: ${init}`)

// 添加订阅事件
const listener = () => {
  const current = store.getState()
  console.log(`count: ${current}`)
}
store.subscribe(listener);

// 派遣 action 任务
store.dispatch(add())
store.dispatch(less())
