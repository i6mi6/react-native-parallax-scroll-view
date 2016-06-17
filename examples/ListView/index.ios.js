import React from 'react'
import { AppRegistry, StatusBarIOS, processColor } from 'react-native';

import Talks from './Talks';

StatusBarIOS.setStyle('light-content');

AppRegistry.registerComponent('ListViewExample', () => Talks);
