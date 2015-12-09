import React, {
  Component,
  ListView,
  View
} from 'react-native';

const {
  number
} = React.PropTypes;

class ParallaxListView extends Component {
  render() {
    const { rowHeight, ...listViewProps } = this.props;
    return <ListView { ...listViewProps }/>;
  }
}

ParallaxListView.propTypes = {
  ...ParallaxListView.propTypes,
  rowHeight: number.isRequired
};

export default ParallaxListView;
