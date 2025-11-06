function DataSetAccess({ title, date }) {
    return (
        <>
            <div style={{border: "4px solid #535bf2"}}> 
                <p> {title} </p>  
                <p style={{color: "grey"}}> {date} </p>
            </div>
        </>
    )
}

export default DataSetAccess;