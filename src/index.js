import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { createStore, applyMiddleware } from './woniu-redux'
import thunk from './woniu-redux-thunk'// 处理异步 action 中间件
import arrThunk from './woniu-redux-array'// 自定义中间件
import { counter } from './index.redux'// reducer
import { Provider } from './woniu-react-redux';

const store = createStore(counter, applyMiddleware(arrThunk, thunk))
ReactDOM.render(
  (
      <Provider store={store}>
        <App />
      </Provider>
  ),
  document.getElementById('root')
)

