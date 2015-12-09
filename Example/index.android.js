const React = require('react-native');
const {
  AppRegistry,
  Component,
  ListView,
  StyleSheet,
  Text,
  View
  } = React;

class Example extends Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.state =  {
      dataSource: ds.cloneWithRows(['Value of Values', 'Simplicity Matters'])
    };
  }

  render() {
    return (
      <ListView
        dataSource={ this.state.dataSource }
        renderRow={ rowData => <View style={ styles.row }>{ rowData }</View> }
        rowHeight={40}
      />
    );
  }
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: 40
  },
  text: {
    fontSize: 20
  }
});

AppRegistry.registerComponent('Example', () => Example);
