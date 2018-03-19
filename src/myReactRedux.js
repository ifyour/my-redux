import PropTypes from 'prop-types'

export const connect = (mapStateToProps = (state) => state, mapDispatchToProps={}) => (WrapComponent) => {
  return class ConnectComponent extends React.Component{
    static contextTypes = {
      store: PropTypes.object
    }
    constructor (props, context) {
      super(props, context)
      this.state = {
        props: {}
      }
    }
    componentDidMount () {
      const {store} = this.context // 从 Provider 中获取的 store 放入当前需要包装的组件中
      this.update()
      store.subscribe(()=>this.update())
    }
    update () {
      const { store } = this.context
      const stateProps = mapStateToProps(store.getState())
      this.setState({
        props: {
          ...this.state.props,
          ...stateProps
        }
      })
    }
    render () {
      return <WrapComponent {...this.props}/>
    }
  }
}