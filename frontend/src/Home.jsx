import './Home.css'
import {useState } from 'react'

function Home() {
    /* function setCount(newCounter) {
        counter = newCount
        // Does other stuff (save to some storage so that it isn't refreshed when we reload the page)
    } */
    let [counter, setCounter] = useState(1)
    return (
        <>
            <h1> Welcome to the Home Page! { counter } </h1>
            <button onClick={() => {setCounter(counter + 1)}}> Click me! </button>
        </>
    )
}

export default Home;