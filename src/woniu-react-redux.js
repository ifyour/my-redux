import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from './woniu-redux'

export const connect = (mapStateToProps=state=>state,mapDispatchToProps={})=>(WrapComponent)=>{
	return class ConnectComponent extends React.Component{
		static contextTypes = {
			store:PropTypes.object
		}
		constructor(props, context){
			super(props, context)
			this.state = {
				props:{}
			}
		}
		componentDidMount(){
			const {store} = this.context
			// 当前状态 update 后, 放入监听器中, 用于下一次的更新(每次 dispatch 后会执行 subscribe 中的所有函数) 
			store.subscribe(()=>this.update())
			this.update()
		}
		update(){
			const {store} = this.context
			const stateProps = mapStateToProps(store.getState())
			const dispatchProps = bindActionCreators(mapDispatchToProps, store.dispatch)
			this.setState({
				props:{
					...this.state.props,
					...stateProps,
					...dispatchProps	
				}
			})
		}
		render(){
			return <WrapComponent {...this.state.props}></WrapComponent>
		}
	}
}

export class Provider extends React.Component{
	static childContextTypes = {
		store: PropTypes.object
	}
	getChildContext(){
		return {store:this.store}
	}
	constructor(props, context){
		super(props, context)
		this.store = props.store
	}
	render(){
		return this.props.children
	}
}