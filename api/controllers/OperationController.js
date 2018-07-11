/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // async update(req, res){
  //   var data = sails.helpers.getReqRecord(Operation);
  //   sails.
  // },

  async create(req, res) {
    var data = sails.helpers.getReqRecord(Operation);
    let success = await sails.helpers.performOperation.with({
      account: data.account,
      amount: data.amount,
      isDeposit: data.isDeposit || false
    });

    if (!success){
      return res.serverError(new Error('The server failed to perform the operation.'));
    }
    Operation.create(data).meta({fetch: true}).exec(function created (err, newInstance) {

      if (err) {
        switch (err.name) {
          case 'AdapterError':
            switch (err.code) {
              case 'E_UNIQUE': return res.badRequest(err);
              default: return res.serverError(err);
            }//•
          case 'UsageError': return res.badRequest('Usage Error');
          default: return res.serverError(err);
        }
      }

      if (req._sails.hooks.pubsub) {
        if (req.isSocket) {
          console.log('se subscribio');
          Operation.subscribe(req, [newInstance.id]);
          Operation._introduce(newInstance);
        }
        Operation.publish([newInstance.id], newInstance, !req.options.mirror && req);
      }

      // Send response
      res.ok(newInstance);

    });

  }
};


