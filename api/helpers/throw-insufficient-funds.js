module.exports = {
  friendlyName: 'Throws insuficient Funds for model',
  inputs: {
    model: {
      type: 'ref'
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Error',
      outputType: 'ref'
    },
  },
  sync: true,

  fn: function (inputs, exits) {
    let model = (typeof inputs.model === 'object') ?
      inputs.model.constructor.prototype.identity :
      inputs.model;
    let error = new Error( `${model} + InsufficientFunds` );
    error.code = `${model} + InsufficientFunds`;
    return exits.success(error);
  }


};

