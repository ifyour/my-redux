import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { createStore, applyMiddleware } from './redux/redux'
import thunk from './redux/middleware/redux-thunk'// 处理异步 action 中间件
import arrThunk from './redux/middleware/redux-array'// 自定义中间件
import { counter } from './store/index.redux'// reducer
import { Provider } from './redux/react-redux/react-redux';

const store = createStore(
    counter,
    applyMiddleware(arrThunk, thunk)
)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)