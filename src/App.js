import React, {Component} from 'react';
import Navigation from "./Components/Navigation/Navigation";
import Logo from "./Components/Logo/Logo";
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import Rank from "./Components/Rank/Rank";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";
import SignIn from "./Components/SignIn/SignIn";
import Register from "./Components/Register/Register";
import './App.css';
import 'tachyons';
import Particles from "react-particles-js";
import Clarifai from 'clarifai';

const app = new Clarifai.App({
    apiKey: '685fb89f86854c7aa91627ec423de6e1'
});

const particlesOptions = {
    particles: {
        number: {
            value: 200,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signIn',
            isSignedIn: false
        }
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputImage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    };

    displayFaceBox = (box) => {
        console.log(box);
        this.setState({box: box})
    };

    onInputChange = (event) => {
        this.setState({input: event.target.value})
    };

    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
        app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
            .then( response => this.displayFaceBox(this.calculateFaceLocation(response)))
            .catch(err => console.log(err));
    };

    onRouteChange = (route) => {
        if(route === 'signOut') {
            this.setState({isSignedIn: false})
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route});
    };

    render() {
        const { isSignedIn, imageUrl, box, route } = this.state;
        const { onRouteChange, onInputChange, onButtonSubmit } = this;
        return (
            <div className="App">
                <Particles className='particles'
                           params={particlesOptions}
                />
                <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange}/>
                { route === 'home'
                    ? <React.Fragment>
                        <Logo/>
                        <Rank/>
                        <ImageLinkForm onInputChange={onInputChange}
                                       onButtonSubmit={onButtonSubmit}/>
                        <FaceRecognition box={box} imageUrl={imageUrl}/>
                    </React.Fragment>
                    : (
                        route === 'signIn'
                    ? <SignIn onRouteChange={onRouteChange}/>
                    : <Register onRouteChange={onRouteChange} />
                    )
                }
            </div>
        );
    }
}

export default App;
