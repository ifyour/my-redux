export function createStore(reducer, enhancer){
	console.log('createStore called!!!')
	if (enhancer) {
		return enhancer(createStore)(reducer)
	}
	let currentState;// 当前 state 
	let currentListeners = []// 需要 subscribe 触发的监听器

	function getState(){
		return currentState
	}
	function subscribe(listener){
		currentListeners.push(listener)
	}
	function dispatch(action){
		currentState = reducer(currentState, action)
		currentListeners.forEach(v=>v())
		return action
	}
	dispatch({type:'@IMOOC/WONIU-REDUX'})
	return { getState, subscribe, dispatch}
}

// 没有中间件的过程 action --> reducer
// 有中间件的过程 action --> middleware --> reducer
export function applyMiddleware(...middlewares){
	// 返回上面实现的 createStore 函数
	// ...args 代表所有往 createStore 传入的参数即: reducer
	return createStore=>(...args)=>{
		const store = createStore(...args)
		let dispatch = store.dispatch

		const midApi = {
			getState:store.getState,
			dispatch:(...args)=>dispatch(...args)
		}
		// 每一个 middleware 最终这样执行  middleware(midApi)(store.dispatch)(action)
		const middlewareChain = middlewares.map(middleware=>{
			return middleware(midApi)
		})
		// console.log(compose(...middlewareChain)(store.dispatch))
		dispatch = compose(...middlewareChain)(store.dispatch)
		return {
			...store,
			dispatch // 使用 能力增强的 dispatch 覆盖掉原装 store 中的dispatch
		}
	}
}

// compose 的实际作用
// compose(fn1, fn2 ,fn3)  => fn1(fn2(fn3))
export function compose(...funcs){
	if (funcs.length===0) {
		return arg=>arg
	}
	if (funcs.length===1) {
		return funcs[0]
	}
	return funcs.reduce((ret,item)=> (...args)=>{
		// console.log(ret)
       return ret(item(...args))
      })
}
function bindActionCreator(creator, dispatch){
	return (...args) => dispatch(creator(...args))
}
export function bindActionCreators(creators, dispatch){
	return Object.keys(creators).reduce((ret,item)=>{
		// 把每一个 action 用 dispatch 包装一下: action = dispatch(action())
		ret[item] = bindActionCreator(creators[item],dispatch)
		return ret
	},{})
}
