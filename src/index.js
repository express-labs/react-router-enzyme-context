import createHistory from 'history/createMemoryHistory';
import PropTypes from 'prop-types';

export default class ReactRouterEnzymeContext {
  constructor(options) {
    const defaults = {
      initialEntries: ['/'],
      initialIndex: 0,
      keyLength: 6,
      getUserConfirmation: null,
    };

    this.context = {
      router: {
        history: createHistory(Object.assign({}, defaults, options)),
      },
    };

    this.context.router.route = {
      location: this.context.router.history.location,
    };

    this.childContextTypes = {
      route: PropTypes.shape({
        pathName: PropTypes.string,
        search: PropTypes.string,
        hash: PropTypes.hash,
        state: PropTypes.any,
        key: PropTypes.string,
      }),
      router: PropTypes.shape({
        history: PropTypes.shape({
          length: PropTypes.number,
          action: PropTypes.string,
          location: PropTypes.shape({
            pathName: PropTypes.string,
            search: PropTypes.string,
            hash: PropTypes.hash,
            state: PropTypes.any,
            key: PropTypes.string,
          }),
          index: PropTypes.number,
          entries: PropTypes.arrayOf(PropTypes.shape({
            pathName: PropTypes.string,
            search: PropTypes.string,
            hash: PropTypes.hash,
            state: PropTypes.any,
            key: PropTypes.string,
          })),
          push: PropTypes.func,
          replace: PropTypes.func,
          go: PropTypes.func,
          goBack: PropTypes.func,
          goForward: PropTypes.func,
          canGo: PropTypes.func,
          block: PropTypes.func,
          listen: PropTypes.func,
        }),
      }),
    };

    this.history = this.context.router.history;

    this.get = this.get.bind(this);
    this.getChildContextTypes = this.getChildContextTypes.bind(this);
    this.getContext = this.getContext.bind(this);
    this.props = this.props.bind(this);
  }

  getContext() {
    return this.context;
  }

  getChildContextTypes() {
    return this.childContextTypes;
  }

  props() {
    return ({
      history: this.context.router.history,
      location: this.context.router.history.location,
      // match: not yet supported
    });
  }

  get() {
    return ({
      context: this.context,
      childContextTypes: this.childContextTypes,
    });
  }
}
