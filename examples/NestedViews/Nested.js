import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  Text,
  View
} from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';

const window = Dimensions.get('window');
console.log(window.width);

class Nested extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 60, backgroundColor: 'green' }}/>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 60, backgroundColor: 'red' }}/>
          <ParallaxScrollView
              style={{ flex: 1, backgroundColor: 'hotpink', overflow: 'hidden' }}
              renderBackground={() => <Image source={{ uri: `https://placekitten.com/414/350`, width: window.width, height: 350 }}/>}
              renderFixedHeader={() => <Text style={{ textAlign: 'right', color: 'white', padding: 5, fontSize: 20 }}>Hello</Text>}
              parallaxHeaderHeight={ 350 }>
            <View style={{ alignItems: 'center' }}><Text style={{ fontSize: 30 }}>Meow!</Text></View>
          </ParallaxScrollView>
          <View style={{ width: 60, backgroundColor: 'orange' }}/>
        </View>
        <View style={{ height: 60, backgroundColor: 'blue' }}/>
      </View>
    );
  }
}

export default Nested;
