import './Home.css'
import {useState } from 'react'

function Home() {
    /* function setCount(newCounter) {
        counter = newCount
        // Does other stuff (save to some storage so that it isn't refreshed when we reload the page)
    } */
    let [counter, setCounter] = useState(1)
    let [dropStatus, setStatus] = useState(false)
    // let [practice_counter, practicesetCounter] = useState(1)
    // let [practice_status, practicesetStatus] = useState(false)
    return (
        <>
            <a href="/UploadFile"> File Upload Page </a>
            <a href="/UploadVehicle"> Vehicle Upload Page </a>
            <a href="/ViewVehicles"> Vehicle View Page </a>

            <button onClick={async () => {
                const hardcodedFilePath = 'C:/Users/colin/Documents/GTOR/GTOR-DAQ/Data Files/2025-10-18 13_31_29.txt'

                try {
                    const res = await fetch('http://127.0.0.1:3000/toCSV', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ filePath: hardcodedFilePath })
                    })

                    if (res.ok) {
                        const contentDisposition = res.headers.get('content-disposition')
                        let filename = 'download.csv'
                        if (contentDisposition) {
                            const filnameMatch = contentDisposition.match(/filename=?(.+)"?/)
                            if (filenameMatch) {
                                filename = filenameMatch[1]
                            }
                        }

                        const blob = await res.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = filename
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)

                        alert('CSV file downloaded successfully!')
                    } else {
                        alert('Error creating CSV file')
                    }

                } catch (error) {
                    console.error('Error:', error)
                    alert('Network error')
                }
                
            }}> convert file to CSV
            </button>

            <h1> Welcome to the Home Page! </h1>
            <img src = "https://gtor.gatech.edu/img/gtor-logo.jpg" alt = "GTOR logo" width="350"/>
            <p> Have a donut, learn a little, stay a while! </p>
            <button onClick={() => {setCounter(counter + 1)}}> Have a donut</button>
            <p><em>Donuts eaten: </em> {counter}</p>
            <button onClick={() => {setStatus(!dropStatus)}}> Curious about us?</button>
            {dropStatus && <p>Georgia Tech Off-Road is a student-led team founded in 1998 that participates in annual Baja SAE competitions. The team currently has 40 undergraduate members with students majoring mostly in some form of engineering. Students on the team are provided with an opportunity to work on a large scale and time-constrained engineering project. They learn to not only design and analyze vehicle components, but also to develop communication and teamwork skills in ensuring proper integration between designs.  The North America Baja SAE competitions take place at three event locations each year and have upwards of 100 teams at each event. Student teams are tasked with designing and fabricating a high-performing single-seat off-terrain vehicle to sell to the enthusiast market. Teams compete in a set of static and dynamic events that span evaluations from vehicle designs to business models. Professionals from industry are involved with the competition and serve as judges to assess the student teams.</p>}

        </>
    )
}

export default Home;