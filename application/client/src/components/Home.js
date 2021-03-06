import React from 'react'
import './Home.css'
// import 'bootstrap/dist/js/bootstrap.bundle';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import 'bootstrap/dist/js/bootstrap.js';
// import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import Picture1 from './pictures/text1.png'
import Picture2 from './pictures/text2.png'


// Basic placeholder for the home/launching page
function Home(){
    return(
        <div className="body">
            <div className="greeting">
                Start your journey with SFSU Tutoring today: Find the tutor that is right for you!
            </div>
            <div className="text">
                <div className="text1">
                <div className= "text1-left">
                    <img src={Picture1} className='h-img'/>
                </div >
                <div className="text1-right">
                <h1>
                    Why use SFSU Tutoring?
                </h1>
                - Select a tutor from a number of different classes and majors
                <br/><br/>
                - Book appointments to meet on campus or setup meetings online
                <br/><br/>
                - Help with classwork, study for tests, or review subjects
                <br/><br/>
                - View reviews of tutors to find the one that suits your needs
                <br/><br/>
                - Get help from fellow SFSU students
                </div>
            </div>

            <div className="text2">
                <div className="text2-left">
                    <h1>
                    Online Learning available!
                    </h1>
                    We understand that times are tough right now for a lot of students, to make up for this we have opened
                    online tutoring! Book an appointment to meet a tutor virtually through Zoom!
                    <br/> 
                    <div className="click">
                        Click the link below to get started!
                    </div>
                    <Button variant="contained" className="browse-button" href="/Registration">Create an Account</Button>
                </div>
                <div className="text2-right">
                    <img src={Picture2} className='h-img1'/>
                </div>
                </div>
            </div>
        </div>
    )
}

export default Home;