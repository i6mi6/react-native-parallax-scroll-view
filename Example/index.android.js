/*
 * This Android demo shows how to integrate `PullToRefreshViewAndroid` with `ParallaxHeaderListView`.
 */
import React, {
  AppRegistry,
  Component,
  PullToRefreshViewAndroid,
  View,
} from 'react-native';
import { throttle } from 'react-native-parallax-listview/lib/utils';

import Talks from './Talks';

class AndroidExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false
    };
    this._maybeUpdateRefreshEnabled = (scrollY) => {
      if (scrollY <= 10) {
        this.setState({ refreshEnabled: true });
      } else {
        this.setState({ refreshEnabled: false });
      }
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return ['isRefreshing', 'refreshEnabled'].some(prop => nextState[prop] !== this.state[prop]);
  }

  render() {
    return (
      <PullToRefreshViewAndroid
        style={{ flex: 1 }}
        colors={['#000', '#999', '#fff']}
        progressBackgroundColor={'#fff'}
        enabled={this.state.refreshEnabled}
        refreshing={this.state.isRefreshing}
        onRefresh={() => {
          this.setState({ isRefreshing: true });
          setTimeout(() => {
            this.setState({ isRefreshing: false });
          }, 1000);
        }}>
        <Talks
          key="talks"
          onScroll={(e) => {
            this._maybeUpdateRefreshEnabled(e.nativeEvent.contentOffset.y);
          }}/>
      </PullToRefreshViewAndroid>
    );
  }
}

AppRegistry.registerComponent('Example', () => AndroidExample);
