# Overview

Mockups of our different models

## Dataset

Dataset contains metadata on our dataset and references to the actual data. Our sqlite database will contain many dataset items.
```
id: TEXT # Unique identifier for the dataset
title: TEXT # Human readable title of the dataset
description: TEXT # Description of the dataset, notes on collection, etc.
date: TEXT # Date of recording
location_id: FOREIGN_KEY # Links to a Location
competition: INTEGER check(competition IN (0, 1)) # Was this data collected during a competition (1 = true, 0 = false)
uploaded_at: TEXT # Date when file was uploaded
update_at: TEXT # Date of most recent update
```

## Location
Locations are a tree-like in that they may have sub-locations. For example iron mountain would have sub locations to a different testing tracks. Note that each location may only have one parent but may have many children.
```
id: TEXT # Unique identifier for the location
title: TEXT # Human readable title
description: TEXT # Description of the location
competition: INTEGER check(competition IN (0, 1)) # Is this a competition site (1 = true, 0 = false)
parent_id: TEXT REFERENCES Location(id) # ID to parent node
```