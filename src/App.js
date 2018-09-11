import React, { Component, Fragment } from 'react';
import './App.css';
import axios from 'axios';
import Qs from 'qs';

// COMPONENTS
import Results from './components/Results';
import Footer from './components/Footer';
import Form from './components/Form';


class App extends Component {
  constructor() {
    super();
    this.state = {
      restaurants: [],
      // lat: '',
      // lon: '',
      destination: '',
      originAddress: '',
      directions: '',
      restaurantDetails: [],

    }
  }
  componentDidMount() {
      var startPos;
      var geoSuccess = (position) => {
        startPos = position;
        const lat = document.getElementById('startLat').innerHTML = startPos.coords.latitude;
        const lon = document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        axios({
          method: 'GET',
          url: 'https://proxy.hackeryou.com',
          dataResponse: 'json',
          paramsSerializer: function (params) {
            return Qs.stringify(params, { arrayFormat: 'brackets' })
          },
          params: {
            reqUrl: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            params: {
              key: 'AIzaSyDZWNrRFSs1j2Mjhfaj8KHbQI91VuACATk',
              location: `${lat} ${lon}`,
              radius: 1000,
              keyword: 'restaurant',
              opennow: true,
            },
            xmlToJSON: false
          }

        }).then(res => {
          console.log(res.data.results)
          this.setState ({
            restaurants: res.data.results,
            originAddress: `${lat} ${lon}`,
          }, () => {
            this.state.restaurants.map((restaurant) => {
              // console.log(restaurant.place_id)
              axios({
                method: 'GET',
                url: 'https://proxy.hackeryou.com',
                dataResponse: 'json',
                paramsSerializer: function (params) {
                  return Qs.stringify(params, { arrayFormat: 'brackets' })
                },
                params: {
                  reqUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
                  params: {
                    key: 'AIzaSyBoRawmMG_0IPI25vStlhDGFifDwDcWZFs',
                    placeid: restaurant.place_id,
                  },
                  xmlToJSON: false
                }
              }).then(res => {
                const detailObject = {}
                detailObject.id = restaurant.place_id
                detailObject.phoneNum = res.data.result.formatted_phone_number
                detailObject.menu = res.data.result.website
                // console.log(detailObject)
                const newState = this.state.restaurantDetails
                newState.push(detailObject);
                this.setState({
                  restaurantDetails: newState
                })
              })
            })
          })
        })
      } // end of geoSuccess
      var geoError = (error) => {
        console.log('Error occurred. Error code: ' + error.code);
        document.querySelector('.hide').classList.remove('hide');
      } // end of geoError
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    };
  // }
  
  getDestination = (destination) => {
    this.setState({
      destination: destination
    }, () => {
      axios({
        method: 'GET',
        url: 'https://proxy.hackeryou.com',
        dataResponse: 'json',
        paramsSerializer: function (params) {
          return Qs.stringify(params, { arrayFormat: 'brackets' })
        },
        params: {
          reqUrl: 'https://maps.googleapis.com/maps/api/directions/json?',
          params: {
            key: 'AIzaSyBoRawmMG_0IPI25vStlhDGFifDwDcWZFs',
            origin: `${this.state.originAddress}`,
            destination: `${this.state.destination}`,
            mode: 'walking'
          },
          xmlToJSON: false
        }
      }).then(res => {
        this.setState({
          directions: res.data.routes[0].legs[0].steps
        })
        this.props.history.push({
          pathname: '/results/directions',
          destination:this.state.destination,
          directions:this.state.directions,
        })
      })
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
    return (
      <React.Fragment>
        <main className="App">
          <h2>StumbleGrumble</h2>
          <div className="wrapper">
              <Form getUserInput={this.getUserInput} getOriginAddress={this.getOriginAddress}/>
              <Results restaurantsArray={this.state.restaurants} getDestination={this.getDestination} destination={this.state.destination} restaurantDetails={this.state.restaurantDetails}/>
              <div id="startLat"></div>   
              <div id="startLon"></div>  
              
          </div>
        </main>
        <Footer/>
      </React.Fragment>
      

    );
  }
}

export default App;

// on get started, app will prompt user to allow location services (geolocation api)
// once allowed, the results will display the resautrants within a default 1km radius (the user can also search by rating, price, etc.)
// if they decline geolocation, create an array of funny responses to cycle through "well, do you want to eat?"
// OOOOR if the decline, displya the form so they acn type in their location
// on each card, the restaurant name, hours, phone number, menu, distance, and 'get directions' button is displayed
// the user can change the radius at the top if they want
// when get direction is clicked, the directions API loads and routes us to our Directions component
// the directions component takes the user's location from the geolocation api and the address from the places api and displays a route on a map
// add preloader!!

// find a way to re-route user to Results.js on refresh of DestinationMap.js
