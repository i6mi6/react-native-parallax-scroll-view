import React, { AppRegistry, StatusBarIOS, processColor } from 'react-native';

import Example from './Example';

StatusBarIOS.setStyle('light-content');

AppRegistry.registerComponent('Example', () => Example);
