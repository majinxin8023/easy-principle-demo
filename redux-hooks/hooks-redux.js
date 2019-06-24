import React from "react";
const { createContext, useContext, useReducer } = React

// 把reduer集成到Action中
const reducerInAction = (state, action) => {
    if (typeof action.reducer == 'function') { // action对状态管理， 一触发直接生效
        return action.reducer(state)
    }
    return state
}
const middleWareLog = (store, lastState, nextState, action ) => {
    console.log('🍎', store)
    console.log('🍌', lastState)
    console.log('🍊', nextState)
    console.log('🐘', action)
}
export default function createStore(params) {
    const {isDev, reducer, middleWare, initialState} = {
        isDev: false, // 不传给出来的默认值
        initialState: {}, // state
        reducer: reducerInAction,
        middleWare: [middleWareLog], // 中间件处理的事情
        ...params // 用户的所有参数
    }
    const MjxContnet = createContext()
    const store = {
        _state: initialState, // store里面存在的内容就是state
        dispatch: undefined, // 派发要做的事情
        useContext: function(){ //上下文
            return useContext(MjxContnet)
        },
        getState: function (){
            return store._state
        }
    }
    let isCheckedMiddleWare = false // 检验用户传递过来的中间件
    const middleWareReducer = (state, action) => { // state表示最后的一波state
        let nextState = reducer(state, action)
        if (!isCheckedMiddleWare) {
            if (!Array.isArray(middleWare)) {
                throw new Error('请设置middleWare为数组🌿')
            }
            isCheckedMiddleWare = true
        }
        for (let item of middleWare) {
            const newState = item(store, state, nextState, action) // 调用中间件
            if (newState) { // 如果有中间件出来回来新的state 则赋值
                nextState = newState
            }
        } 
        store._state = nextState // return出来最新的state的同时,请修改store的_state 做到同步
        return nextState 
    }
    const Provider = props => {
        // 参数1接受一个reducer函数为参数，这个函数里面接收2个参数「state, action」
        const [ state, dispatch ] = useReducer(middleWareReducer, initialState)
        if (!store.dispatch) {
            store.dispatch = async function(action){
                if (typeof action == 'function') {
                    await action(dispatch, store._state)
                } else {
                    dispatch(action)
                }
            }
        }
        return <MjxContnet.Provider {...props} value={state}/>
    }
    return {
        Provider,
        store
    }
}