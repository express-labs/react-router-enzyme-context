import createHistory from 'history/createMemoryHistory';
import PropTypes from 'prop-types';

export default class ReactRouterEnzymeContext {
  constructor() {
    this.context = {
      router: {
        history: createHistory(),
      },
    };

    this.childContextTypes = {
      router: PropTypes.shape({
        history: PropTypes.shape({
          length: PropTypes.number,
          location: PropTypes.shape({
            pathName: PropTypes.string,
            search: PropTypes.string,
            hash: PropTypes.hash,
            state: PropTypes.any,
            key: PropTypes.string,
          }),
          push: PropTypes.func,
          replace: PropTypes.func,
          go: PropTypes.func,
          goBack: PropTypes.func,
          goForward: PropTypes.func,
          canGo: PropTypes.func,
          block: PropTypes.func,
        }),
      }),
    };
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
