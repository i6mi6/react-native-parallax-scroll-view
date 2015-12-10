import React, { AppRegistry, StatusBarIOS, processColor } from 'react-native';

import Example from './example';

StatusBarIOS.setStyle('light-content');

AppRegistry.registerComponent('Example', () => Example);
