# react-router-enzyme-context
A helper for mocking react router v4 context and childContextTypes when testing components with Enzyme mount() and shallow().

This package uses React-Router's history module to mock the history.  Specifically, we use their memoryHistory module which was designed for use in testing environments.

It creates a context option and a contextChildTypes option that can be used by Enzyme's mount() and shallow() API's to ensure that all descendants of the component being tested have the correct react-router context.

#### Install

`npm install --save-dev react-router-enzyme-context`

#### Quick Usage Example

```javascript
  const options = new ReactRouterEnzymeContext();
  const wrapper = mount(
    <ClickMe destination="/somehwere/someplace" />,
    options.get()
  );
});
```

Or...

```javascript
const options = new ReactRouterEnzymeContext();
const wrapper = mount(
  <ClickMe destination="/somehwere/someplace" />,
  {
    context: options.getContext(),
    childContextTypes: options.getChildContextTypes(),
  }
);
```





## Problem
Let's say you are performing a unit test on a component that uses react-router v4's Link component. When you click on the link, a react-router executes a route, and the component increments a counter that is stored in it's state.

Here is our simple example of a "dumb component" that would be placed within a "container component" that, in turn, is part of a react router route.

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import scss from './MyExample.scss';

export default class ClickMe extends React.Component {
  static propTypes = {
    destination: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.state = {
      count: 0,
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({
      count: this.state.count += 1,
    });
  }

  render () {
    return (
      <div className={scss.linkWrapper}>
        <Link
          className={scss.link}
          to={this.props.destination}
          onClick={this.onClick}
        >
          Clicked
          <span className={scss.count}>{this.state.count}<span> Times!<span>
        </Link>
      </div>
    )
  }
}
```

Here is an integration test using jest and enzyme to see if the counter increments.

```javascript
import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import ClickMe from './ClickMe';

configure({ adapter: new Adapter() });

describe('<ClickMe />', () => {
  it('should increment when clicked', () => {
    const wrapper = mount(<ClickMe destination="/somehwere/someplace" />);
    wrapper.find('.link').simulate('click');
    expect(wrapper.state('count')).toBe(1);
  });  
})
```

The test above will crash because Enzyme will complain that the Link component must be a descendant of a Router compnent. The react-router library uses React's [**context**](https://reactjs.org/docs/context.html) feature to pass data between other react-router components.  Many React component libraries use context to communicate.

```
● <Click Me /> › should increment when clicked

   Invariant Violation: You should not use <Link> outside a <Router>
```

You can go through the trouble of wrapping your `<ClickMe>` component inside of a `<Router>`. However, enzyme can only find the state of the root component.

```javascript
<Router>  // <--- I am now the root
  <ClickMe> // <--- Enzyme can't test my state or props because I'm not the root!
</Router>
```

## Solution
Enzyme lets you specify the context directly when you call mount or shallow.  Both [**mount**](http://airbnb.io/enzyme/docs/api/mount.html#mountnode-options--reactwrapper) and [**shallow**](http://airbnb.io/enzyme/docs/api/shallow.html#shallownode-options--shallowwrapper) have a second optional argument where you can supply context and other things.

Here is an excerpt from the Enzyme documentation:

---

### mount(node[, options]) => ReactWrapper

#### Arguments

1. node (ReactElement): The node to render
2. options (Object [optional]):
3. options.context: (Object [optional]): Context to be passed into the 4. component
5. options.attachTo: (DOMElement [optional]): DOM Element to attach the component to.
6. options.childContextTypes: (Object [optional]): Merged contextTypes for all children of the wrapper.

#### Returns
- ReactWrapper: The wrapper instance around the rendered output.

---
When you supply the context in this manner, your `<ClickMe />` component is still the root!  So you can test state and props.  

Here is an example using our react-router-enzyme-context module.

```javascript
import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ReactRouterEnzymeContext from 'react-router-enzyme-context';

import ClickMe from './ClickMe';

configure({ adapter: new Adapter() });

describe('<ClickMe />', () => {
  it('should increment when clicked', () => {
    const options = new ReactRouterEnzymeContext();
    const wrapper = mount(
      <ClickMe destination="/somehwere/someplace" />,
      options.get()
    );
    wrapper.find('.link').simulate('click');
    expect(wrapper.state('count')).toBe(1);
  });  
})
```


### Simulating props passed via withRouter() HOC

If the component you are testing is directly wrapped by react-router's withRouter() higher order component, you may want to insert the history and location props into your component.  

Currently, match is not supported.  You'll have to insert those manually.

```javascript
  import React from 'react';
  import { withRouter } from 'react-router';

  export default withRouter((props) => {
    const location = { props };
    return (
      <div>
        <h1>My Location:</h1>
        <p>{location.pathName}</p>
      </div>
    )
  });
```

```javascript
import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ReactRouterEnzymeContext from 'react-router-enzyme-context';

import WhereAmI from './WhereAmI';

configure({ adapter: new Adapter() });

describe('<WhereAmiI />', () => {
  it('should tell me my current location', () => {
    const mockRouter = new ReactRouterEnzymeContext();
    mockRouter.props().history.go('/new/location');
    const wrapper = mount(
      <WhereAmI {...mockRouter.props()} />
    );
    expect(wrapper.find('p').text()).toBe('/new/location');
  });  
})
```
