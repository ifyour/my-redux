/**
 * 当前 APP store 数据中心
 */

// action type
// ------------------------------------
const ADD = 'ADD'
const REMOVE = 'REMOVE'

// reducer
// ------------------------------------
export function counter(state = 10, action) {
  switch (action.type) {
    case ADD:
      return state + 1
    case REMOVE:
      return state - 1
    default:
      return state
  }
}

// action
// ------------------------------------
export function add() {
  return {
    type: ADD
  }
}
export function remove() {
  return {
    type: REMOVE
  }
}
export function addAsync() {
  return dispatch => {
    setTimeout(() => {
      dispatch(add());
    }, 2000);
  };
}