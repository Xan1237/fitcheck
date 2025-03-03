Saul the first thing you should do is explore the site i recomend downloding postman to test the api calls I setup on the backend. As well explore how the frontend react compnents work. Please write documentation as you go it will help you understand everythin as you go. Here is a brief summery of the file structure. 

Backend
    controlers This is where the login for the api calls is all the functions and analisys
    middleware This is where the user auth scripts are and protected channels
    config database connectivity stuff
    routes this is where the api enpoints are setup
Frontend
    This is basic react as you know the syntax
    components folder has all the frontend ui elements
    app.jsx routs all the pages to their apropriate url
    pages holds the layout to all the web pages
    userAth.jsx is the longin slash sign up page
    gym.jsx is a dynamicly routed page that hols all the diffrent gym pages to be added via data
    home.jsx is the home page with the map and diffrent gyms
DataBase
    the database is firestore wich is one of firebases data storage services
    the documentation for this can be found on their website or just coppy my stuff written in the contolers folder to acess or witre to the db. its noSQL so its rly easy.


Saul Please look at the gymData folder in the frontend and fill out the fields by adding all the gyms in nova scotia -Xander
Saul Please fix the background color behind the picture of the gyms when i shrink them to be smaller than the page width it looks terrible - Xander
Saul Please fix the adding comment procesure to make a nice big pop up when where users can write a comment -Xander
Saul Please do some mobile testing i havint really done any and fixing that would be great