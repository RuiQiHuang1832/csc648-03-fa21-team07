import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/js/bootstrap.js';
import React from "react";


class BrowseTutor extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tutors: []
        };
    }
    
    getData(){
        fetch(`/onSubmit?param1=Tutors&param2=`, {
            method: "GET",
            headers: {
                'Content-type': 'application/json'
            }
        })
        .then((result, err) => result.json())
            .then(contents => {
                console.log(contents); //The results are logged on the console of the browser 
                this.setState({tutors: contents});
            });
        }
    
    render(){
        return(
            <div>
                hello
            </div>
        );
    }
}
export default BrowseTutor;