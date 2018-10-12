import React, { Component, Fragment, Link } from 'react';
import './App.css';
import axios from 'axios';
import Qs from 'qs';
// COMPONENTS
import Results from './components/Results';
import Footer from './components/Footer';
import Form from './components/Form';
import logo from './assets/logo.png'


class App extends Component {
  constructor() {
    super();
    this.state = {
      restaurants: [],
      destination: '',
      originAddress: '',
      directions: '',
      restaurantDetails: [],
      userInput: true
    }
  }
  componentDidMount() {
      var startPos;
      var geoSuccess = (position) => {
        this.setState({
          userInput: false
        })
        startPos = position;
        const lat = document.getElementById('startLat').innerHTML = startPos.coords.latitude;
        const lon = document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        axios({
          method: 'GET',
          url: 'https://proxy.hackeryou.com',
          dataResponse: 'json',
          paramsSerializer: function(params) {
            return Qs.stringify(params, { arrayFormat: 'brackets' });
          },
          params: {
            reqUrl:
              'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            params: {
              key: 'AIzaSyAmNTv4jwpUMR9Ib53PVgxCv0zsqxM6FJU',
              location: `${lat} ${lon}`,
              radius: 1000,
              keyword: 'restaurant',
              opennow: true
            },
            xmlToJSON: false
          }
        }).then(res => {
          this.setState(
            {
              restaurants: res.data.results,
              originAddress: `${lat} ${lon}`
            },
            () => {
              this.state.restaurants.map(restaurant => {
                axios({
                  method: 'GET',
                  url: 'https://proxy.hackeryou.com',
                  dataResponse: 'json',
                  paramsSerializer: function(params) {
                    return Qs.stringify(params, {
                      arrayFormat: 'brackets'
                    });
                  },
                  params: {
                    reqUrl:
                      'https://maps.googleapis.com/maps/api/place/details/json',
                    params: {
                      key: 'AIzaSyAtEinSkBfsmHf9Em2PSzzuDIPiIxM_108',
                      placeid: restaurant.place_id
                    },
                    xmlToJSON: false
                  }
                }).then(res => {
                  const detailObject = {};
                  detailObject.id = restaurant.place_id;
                  detailObject.phoneNum =
                    res.data.result.formatted_phone_number;
                  detailObject.menu = res.data.result.website;
                  const newState = this.state.restaurantDetails;
                  newState.push(detailObject);
                  this.setState({
                    restaurantDetails: newState
                  });
                });
              });
            }
          );
        });
      } // end of geoSuccess
      var geoError = function (error) {
        console.log('Error occurred. Error code: ' + error.code);
        document.querySelector('.hide').classList.remove('hide');
      }; // end of geoError
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }; //end of component did mount
  // }
  setPlaceDetails = (details) => {
    this.setState({
      restaurantDetails: details,
    })
  }
  getDestination = (destination) => {
    this.setState({
      destination: destination
    }, () => {
      axios({
        method: 'GET',
        url: 'https://proxy.hackeryou.com',
        dataResponse: 'json',
        paramsSerializer: function(params) {
          return Qs.stringify(params, { arrayFormat: 'brackets' });
        },
        params: {
          reqUrl: 'https://maps.googleapis.com/maps/api/directions/json?',
          params: {
            key: 'AIzaSyABmgjBqwtrOCrUeczRs3ETTkR9SvxMldE',
            origin: `${this.state.originAddress}`,
            destination: `${this.state.destination}`,
            mode: 'walking'
          },
          xmlToJSON: false
        }
      }).then(res => {
        console.log(res.data);
        this.setState({ directions: res.data.routes[0].legs[0].steps });
        this.props.history.push({
          pathname: '/results/directions',
          destination: this.state.destination,
          directions: this.state.directions
        });
        // console.log(res);
      });
    })  
  }
  getUserInput = (restaurantsArray) => {
    this.setState({
      restaurants: restaurantsArray
    })
  }
  getOriginAddress = (originAddress) => {
    this.setState({
      originAddress: originAddress
    })
  }
  render() {
    // console.log(this.state.restaurantDetails)
    return (
      <div className="stumbleGrumble">
        <main>
          <h2>StumbleGrumble</h2>
          {/* <Link to="/"> */}
            <figure className="logo">
              <img src={logo} alt="Logo for StumbleGrumble"/>
            </figure>
          
          {/* </Link> */}
          <Form getUserInput={this.getUserInput} getOriginAddress={this.getOriginAddress} setPlaceDetails={this.setPlaceDetails}/>
          <div className="wrapper">
              <Results restaurantsArray={this.state.restaurants} getDestination={this.getDestination} destination={this.state.destination} restaurantDetails={this.state.restaurantDetails} userInput={this.state.userInput}/>
              <div id="startLat"></div>   
              <div id="startLon"></div>  
              
          </div>
        </main>
        <Footer/>
      </div>
      

    );
  }
}

export default App;
