/*
 * This Android demo shows how to integrate `PullToRefreshViewAndroid` with `ScrollableParallaxView`.
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
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <PullToRefreshViewAndroid
        ref={ref => { this._pullToRefresh = ref }}
        style={{ flex: 1 }}
        colors={['#000', '#999', '#fff']}
        progressBackgroundColor={'#fff'}
        enabled={true}
        refreshing={false}
        onRefresh={() => {
          this._pullToRefresh.getInnerViewNode().setNativeProps({ refreshing: true });
          setTimeout(() => {
            this._pullToRefresh.getInnerViewNode().setNativeProps({ refreshing: false });
          }, 5000);
        }}>
        <Talks
          key="talks"
          onScroll={(e) => {
            if (e.nativeEvent.contentOffset.y <= 0) {
              this._pullToRefresh.getInnerViewNode().setNativeProps({ enabled: true });
            } else {
              this._pullToRefresh.getInnerViewNode().setNativeProps({ enabled: false });
            }
          }}/>
      </PullToRefreshViewAndroid>
    );
  }
}

AppRegistry.registerComponent('Example', () => AndroidExample);
