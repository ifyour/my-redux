import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from './woniu-redux'// 工具类方法, 给所有的 action 包装上 dispatch

export const connect = (mapStateToProps = state => state, mapDispatchToProps = {}) => (WrapComponent) => {
	return class ConnectComponent extends React.Component {
		static contextTypes = {
			store: PropTypes.object
		}
		constructor(props, context) {
			super(props, context)
			this.state = {
				props: {}
			}
		}
		componentDidMount() {
			const { store } = this.context
			// 当前状态 update 后, 放入监听器中, 用于下一次的更新(每次 dispatch 后会执行 subscribe 中的所有函数) 
			store.subscribe(() => this.update())
			this.update()
		}
		update() {
			const { store } = this.context
			const stateProps = mapStateToProps(store.getState())
			const dispatchProps = bindActionCreators(mapDispatchToProps, store.dispatch)
			this.setState({
				props: {
					...this.state.props,
					...stateProps,
					...dispatchProps
				}
			})
		}
		render() {
			return <WrapComponent {...this.state.props}></WrapComponent>
		}
	}
}

export class Provider extends React.Component {
	static childContextTypes = {
		store: PropTypes.object
	}
	getChildContext() {
		return { store: this.store }
	}
	constructor(props, context) {
		super(props, context)
		// 把从 createStore 中传入的 store 放入全局, 以供 connect 调用
		this.store = props.store
	}
	render() {
		return this.props.children
	}
}