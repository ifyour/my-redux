现在我们的 Redux 和 React-Redux 已经基本实现了，在 Redux中，触发一个 action，reducer 立即就能算出相应的 state，如果我要过一会才让 reducer 计算 state 那怎么办？也就是我们如何实现异步的 action 呢？这里就要用到中间件（middleware）

## 1. 中间件（middleware）介绍

中间就是在 action 与 reducer 之间又加了一层，没有中间件的 Redux 的过程是：`action -> reducer`，而有了中间件的过程就是`action -> middleware -> reducer`，使用中间件我们可以对 action 也就是对 dispatch 方法进行装饰，我们可以用它来实现异步 action、打印日志、错误报告等功能。

又是装饰器，没错，这块的好多东西都离不开装饰器模式，所以，设计模式很重要。关于中间件，有很多框架或者是类库都使用了中间件，像 express、koa、mongoose 等都有使用。

## 2. Redux 中间件的使用

我们可以使用 Redux 提供的 applyMiddleware 方法来使用一个或者是多个中间件，将它作为 createStore 的第二个参数传入即可，我们以 Redux-Thunk 为例

```js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

const store = createStore(counter, applyMiddleware(thunk))
ReactDOM.render(
  (
    <Provider store={store}>
      <App />
    </Provider>
  ),
  document.getElementById('root')
)
```

通过 thunk 中间件，我们就可以实现异步的 action了。

```js
export function addAsync() {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000);
  }
}
```

想要实现中间件，我们首先有两个任务要做：

1. 扩展 createStore 方法，使它可以接收第二个参数。
2. applyMiddleware 方法的实现。

## 3. createStore 方法的扩展

我们在 createStore 中加入第二个参数 enhancer, 专业的解释应该叫增强器，叫 middleware 也可以的。

我们已经说过中间件的作用就是通过改变 dispatch 方法来改变数据流，所以我们这里直接用 enhancer 对 createStore 方法进行装饰。Redux 的源码也是这么写的，哈哈哈哈，怎么和我想到的一模一样呢？因为我看了 Redux 的源码。

```js
export function createStore(reducer， enhancer) {
  if (enhancer) {
    return enhancer(createStore)(reducer)
  }
  let state = {}
  let listeners = []

  function getState() {
    return state
  }

  function subscribe(listener) {
    listeners.push(listener)
  }

  function dispatch(action) {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
    return action
  }

  dispatch({
    type: '@myRedux'
  })
  return { getState, subscribe, dispatch }
}
```

## 4.applyMiddleware 方法的实现

先看我们上边对 enhancer 的调用，enhancer 也就是我们的 applyMiddleware 接受了 createStore 做参数，返回了一个函数，这个函数的参数是reducer。现在我们对这种两层嵌套的函数已经不陌生了，其实它就是一个 return 两层的函数。

我们的 applyMiddleware 主要做了什么呢？首先通过传入的 createStore 方法 create 了一个 store，然后将 store 的 dispatch 传递给middleware，由 middleware 对 dispatch 进行包装，返回一个带有被包装的 dispatch 的 store。

看到这里，很简单嘛。但是注意，还记得我们是怎么使用异步的 action 的吗？

```js
export function addAsync() {
  return (dispatch, getState) => {
    setTimeout(() => {
      dispatch(add())
    }, 2000);
  }
}
```

居然还可以在可以在异步的 action 中拿到 dispatch 和 getState 方法，所以要对这个进行处理，也不是很难，把他俩传给我们的 middle 就好了。

都说到这里了，能不能自己写出来呢？

```js
export function applyMiddleware(middleware) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = store.dispatch

    const midApi = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    dispatch = middleware(midApi)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}
```

如果我们执行了被包装后的 dispatch，就相当于执行了`middleware(midApi)(store.dispatch)(action)`这段语句，这是一个三层的嵌套函数，我们也称作柯里化。

## 5.自己的 redux-thunk

其实自己的 thunk 很简单，正常的 action 的的返回值是个对象，前面已经说过，异步的 action 的返回值是一个函数，那么我们只需要判断一下 action 的返回的类型即可。

```js
const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState)
  }
  return next(action)
}

export thunk
```

在这里呢，dispatch 和 getState 就是我们在 applyMiddleware 中传入的那个 midApi 对象，next 就是 store.dispatch 也可以理解为下一个中间件，如果 action 的类型是  object，说明这是一个同步的，直接 dispatch 就好了，如果 action 的类型是 function，当触发这个 dispatch 的时候，就触发 action 这个函数，同时将 dispatch 和 getState 方法传入到 action 函数中，这也是为什么我们能在异步 action 中拿到 dispatch 和 getState 方法的原因。

## 6.多个中间件合并与 compose 方法

我们的 applyMiddle 方法还不是太完善，只能使用一个中间件，使用多个中间件怎么办，这个简单，map 一下呗。如果是要求多个中间件依此执行怎么办？还是 map 呀，好，来 map 一下。

我们会得到这样的代码：

```js
const store = createStore(
  reducer,
  applyMiddleware(middlewareOne)(
    middlewareTwo(
      middlewareThree(
        // ...
      )
    )
  )
)
```

我们会发现，我们陷入了一个深度嵌套的函数当中，这时我们就需要一个 compose 方法来结合一下，方便我们的书写。

compose 是函数式编程的一种写法，compose 的作用是从右到左结合多个函数，形成一个最终函数。就是将`fn1(fn2(fn3()))`的形式，变成 `compose(fn1, fn2, fn3)` 的形式。

compose 做的只是让你在写深度嵌套的函数时，避免了代码的向右偏移。不要觉得它很复杂。

compose 方法的实现：

```js
export function compose(...funcs) {
  if (funcs.length == 0) {
    return arg => arg
  }
  if (funcs.length == 1) {
    return funcs[0]
  }
  return funcs.reduce((ret, item) => (...args) => {
    // console.log(ret)
    return ret(item(...args))
  })
}
```

compose 不是那么复杂，关于如果想了解更多关于 compose 的知识，可以看看 [Redux对compose的说明](http://cn.redux.js.org/docs/api/compose.html) 

到这里我们可以使用多个中间件的 applyMiddleware 方法已经实现了，整个的 applyMiddleware 方法在这里：

```js
export function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = store.dispatch

    const midApi = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const middlewareChain = middlewares.map(middleware => {
      return middleware(midApi)
    })
    // console.log(compose(...middlewareChain)(store.dispatch))
    dispatch = compose(...middlewareChain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}
export function compose(...funcs) {
  if (funcs.length == 0) {
    return arg => arg
  }
  if (funcs.length == 1) {
    return funcs[0]
  }
  return funcs.reduce((ret, item) => (...args) => {
    // console.log(ret)
    return ret(item(...args))
  })
}
```

到这里，整个 Redux 和 React-Redux 的基本原理我们已经清楚了，也已经基本实现了，发现其中涉及到很多函数式编程和装饰者模式，还有一次观察者模式，所以，编程思想和设计模式是很重要的，有时间一定要加强这方面的学习。

我们现在有了这些基础，可以去看看 Redux 和 React-Redux 的源码，也大体上和我写的是差不多的，因为我也看了源码。



