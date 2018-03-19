

const arrayThunk = ({dispatch,getState})=>next=>action=>{
	// console.log(222222)
	if (Array.isArray(action)) {
		return action.forEach(v=>dispatch(v))
	}
	return next(action)
}
export default arrayThunk