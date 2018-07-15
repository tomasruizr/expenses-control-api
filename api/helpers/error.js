const flaverr = require( 'flaverr' );

module.exports = {
  friendlyName: 'Throws insuficient Funds for model',
  inputs: {
    code: {
      type: 'string'
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Error',
      outputType: 'ref'
    },
  },
  sync: true,

  fn: function ( inputs, exits ) {
    return exits.success( flaverr( inputs.code, new Error( inputs.code )));
  }


};

