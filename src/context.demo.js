import React from 'react'
import PropTypes from 'prop-types'

class Son extends React.Component{
	render(){
			return (
				<div>
					<p>子组件</p>
					<GrandSon/>
				</div>
			)
	}
}

class GrandSon extends React.Component{
	static contextTypes = {
		user:PropTypes.string
	}
	render(){
		console.log(this.context)
		return (
				<div>
					<p>孙组件</p>
					<div>孙组件收到来自父组件的信息：{this.context.user}</div>
				</div>
		)
	}
}

class Father extends React.Component{
	static childContextTypes = {
		user:PropTypes.string
	}
	constructor(props){
		super(props)
		this.state = {user:'user12'}
  }
  // 把当前的状态, 交给全局 context API
  // React 认为全局暴露不是很好的设计模式, 所以需要在使用的地方 使用 childContextTypes 做严格校验
	getChildContext(){
		return this.state
	}
	render(){
		return (
			<div>
				<p>父组件，要给孙组件:{this.state.user}</p>
				<Son/>
			</div>
		)
	}
}

export default Father