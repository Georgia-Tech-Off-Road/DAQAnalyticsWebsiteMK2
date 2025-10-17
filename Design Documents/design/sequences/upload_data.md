# Upload Data
```mermaid
sequenceDiagram
    box UserSystem
        participant U as DAQ_Member
        participant S as System
    end

    box FileSystem
        participant FS as File System
    end

activate S
U->>S: uploadData(file_name.json, metadata)
activate FS
S->>FS: createFolder(file_name)
S->>FS: uploadFile(file_name_raw.json)
S->>FS: uploadFile(metadata.json)
U->>S: validateData(validation_settings)
S-->>U: validation_result
opt Validation suceeded
    U->>S: processData(processing_settings)
    loop resolution layers
        S->>FS: uploadFile(file_name_resolution.json)
    end
    S-->>U: postProcessSuceeded
U-->>S: confirmUpload
S-->>FS: moveFile()
end
deactivate FS
deactivate S
```

# Explanation

DAQ member has collected data from the vehicle. This data is stored in our .json format. The DAQ member inputs metadata about the file, e.g description, data collected, collection location, sensor_format, etc. DAQ member uploads this file data on the website along with its metadata. In its storage space, the server ("system") creates a folder for this data. The server uploads the data file into a **temporary buffer** associated with the user, as well as the user provided metadata. The user then asks the server to validate the data. The server returns if the validation result. If this validation suceeded, the user then request the server to process the data. The server processes the data file, creating files of different resolutions for quick access. The server moves the files once again to the **temporary buffer**. If the post processing suceeds, the user confirms the upload, and the files are moved from the temporary buffer to a folder for this data. If the user exits at any point, the temporary buffer is retained for the user to return to.