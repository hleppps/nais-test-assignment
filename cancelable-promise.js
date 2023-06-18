const isFunction = (value) => value instanceof Function;

class CancelablePromise extends Promise {
  constructor(...args) {
    super(...args);
    this.isCanceled = false;
  }

  cancel = () => {
    this.isCanceled = true;
    if (this.parent) {
      this.parent.cancel();
    }
  };

  then = (onfulfilled, onrejected) => {
    if (!onfulfilled) {
      return this;
    }

    if (!isFunction(onfulfilled)) {
      throw new TypeError("onfulfilled is not a function");
    }

    const onFulfilledWrapper = (value) => {
      if (this.isCanceled) {
        return Promise.reject({ isCanceled: true }).catch((error) => error);
      }

      return Promise.resolve(onfulfilled(value)).catch((error) =>
        onrejected(error),
      );
    };

    const promise = super.then(onFulfilledWrapper, onrejected);
    promise.parent = this;

    return promise;
  };
}

module.exports = CancelablePromise;
