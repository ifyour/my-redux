import { createStore } from 'redux'

function counter(state = 10, action) {
  console.log(state, action)
  switch (action.type) {
    case 'add':
      return state + 1
    case 'less':
      return state - 1
    default:
      return state
  }
}

const store = createStore(counter)

const init = store.getState()
console.log(`Init count: ${init}`)

function listener(){
  const current = store.getState()
  console.log(`count: ${current}`)
}
store.subscribe(listener)

store.dispatch({ type: 'add' })
store.dispatch({ type: 'less' })
