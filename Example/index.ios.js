import React, { AppRegistry, StatusBarIOS, processColor } from 'react-native';

import Talks from './Talks';

StatusBarIOS.setStyle('light-content');

AppRegistry.registerComponent('Example', () => Talks);
