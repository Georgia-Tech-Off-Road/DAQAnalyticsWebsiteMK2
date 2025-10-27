import { useParams } from "react-router"

function Test() {
    let {text} = useParams()
    return (
        <>
            <h1> This is a test page! </h1>
            <p> {text} </p>
        </>
    )
}

export default Test