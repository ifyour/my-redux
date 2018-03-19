import React from 'react'
// import { connect } from './react-redux'

import { connect } from './woniu-react-redux'// 实现了 connect 和 Provider
import { add, remove, addAsync } from './index.redux'

// 装饰器模式
@connect(
  state=>({ num: state}),
  { add, remove, addAsync }
)
class App extends React.Component{
  render(){
    return (
      <div>
        <h2>现在有物品{this.props.num}件</h2>
        <button onClick={this.props.add}>add</button>
        <button onClick={this.props.remove}>remove</button>
        <button onClick={this.props.addAsync}>addAsync</button>
      </div>
    )
  }
}
export default App;
