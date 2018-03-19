/**
 * createStore applyMiddleware 实现
 */
export function createStore (reducer, enhancer) {
  if (enhancer) {
    return enhancer(createStore)(reducer)
  }
  let state = {}
  let listeners = []

  function getState () {
    return state
  }
  function subscribe (listener) {
    listeners.push(listener)
  }
  function dispatch (action) {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
    return action
  }

  dispatch({type: '@myRedux'})
  return {getState, subscribe, dispatch}
}

export function applyMiddleware(...middlewares){
  return createStore=>(...args)=>{
    const store = createStore(...args)
    let dispatch = store.dispatch

    const midApi = {
      getState:store.getState,
      dispatch:(...args)=>dispatch(...args)
    }
    const middlewareChain = middlewares.map(middleware=>middleware(midApi))
    dispatch = compose(...middlewareChain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}