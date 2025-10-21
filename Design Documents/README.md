# Table of Contents



# Overview

## Mission Statement

As a data analytics and visualization website for Georgia Tech Offroad ("GTOR") it is the eponymous mission of this website to provide an acessible means to visualize (1) and analyze (2) data yielded from testing days and live during races, with an emphasis on the former. These goals are clarified in the paragraph below. The intended audience for this website is first and foremost the entirety of GTOR to derive insight easily from DAQ's data collection. A secondary audience of the website is DAQ members, to admnister and monitor our data collection services.


## Design Ethos

It is the objective of this website to be useful in the ways detailed in the paragraph above. However, beyond that, this website is a pedagogical excercise for DAQ members to teach: good software engineering practices, web development skills and system interoperability. To promote good software engineering practices, this project has a large suite of design documents relative to its size. To promote web development skills, Next.js (React.js based) and Express.js are used as industry mainstays that are not too far abstracted from the HTML that is ultimately rendered to the browsers. Flask is used for the supporting python microservices to further demonstrate the power of a RESTful API, and system interoperability. To further promote that final point, it is the eventual goal to implement the python microservices and C++ data receiver server into Docker containers, potentially connected together with kubernetes.

## 1. Data Visualization

As stated before, it is the objective of the website to provide an easy and intuitive way to visualize data collected from testing day. Ease of use is a priority, above functionality. This is not to say that functionality should be omitted, but rather that the default settings (whether it be user, graph, etc.) work effortlessly for the average use case. 

## 2. Data Analysis

As a central and accessible repository for all of our data, it would be foolish not to include, after the MVP, fundemental data analytics tools. Here are some potential examples:

1. Identifying extrema in the data
1. Showing quartiles, median, etc.
1. Trendlines
1. Identifying potential issues in data (RPM imbalance in some scenarios)

That being said, it is not the objective to include every potential analytics tool, and clutter the website. There will always be other tools, in other programs, that could use our data. It is thus a priority, before we develop our own suite of fundemental analytics tools, to make it easy to export data in commonly used formats (.csv, potentially some other formats). 