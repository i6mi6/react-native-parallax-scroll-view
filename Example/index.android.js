/*
 * This Android demo shows how to integrate `PullToRefreshViewAndroid` with `ParallaxHeaderListView`.
 */
import React, {
  AppRegistry,
  Component,
  PullToRefreshViewAndroid,
  View,
} from 'react-native';

import Talks from './Talks';

class AndroidExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false
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
            if (e.nativeEvent.contentOffset.y <= 10) {
              this.setState({ refreshEnabled: true });
            } else {
              this.setState({ refreshEnabled: false });
            }
          }}/>
      </PullToRefreshViewAndroid>
    );
  }
}

AppRegistry.registerComponent('Example', () => AndroidExample);
