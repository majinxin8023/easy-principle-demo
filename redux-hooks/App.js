import React from 'react';
import './App.css';
import hooksRedux from './hooks-redux'
const { Provider, store } =  hooksRedux({
  isDev: true,
  initialState: {
    name: 'Mr.ma',
    age: 25
  }
})

// 假定
// function actionAdd() {
//   return {
//     type: 'addCount',
//     reducer(state) {
//       return {...state, age: state.age  + 1}
//     }
//   }
// }
// 模拟异步请求
function timeoutData(a) {
  return new Promise(cb => setTimeout(() => { cb(a + 1) }, 300))
}
// 模拟promis实现
const actionAdd = () => async(dispatch, ownState)=> {
  let age = await timeoutData(ownState.age)
  dispatch({
    type: 'addCount',
    reducer(state) {
      return {...state, age}
    }
  })
}

function Button() {
  function handleAdd() {
    store.dispatch(actionAdd())
  }
  return <button onClick={handleAdd}>点击</button>
}


function Page(){
  const state = store.useContext()
  return (
    <>
      <span>{state.age}</span>
      <Button/>
    </>
  )
}


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Provider>
          <Page/>
        </Provider>
      </header>
    </div>
  );
}

export default App;
