/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async makeTransfer(req, res){
    let data = req.body;
    await sails.helpers.performOperation.with({
      account: data.origin,
      amount: data.amount,
      isDeposit: false
    });
    await sails.helpers.performOperation.with({
      account: data.destination,
      amount: data.amount,
      isDeposit: true
    });
    Operation.
    res.ok();
  },

  async update(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);
    let previous = await Operation.findOne(data.id);
    await sails.helpers.rollbackOperation(data.id);
    await sails.helpers.performOperation.with({
      account: data.account || previous.account,
      amount: data.amount || previous.account,
      isDeposit: data.isDeposit || previous.isDeposit || false
    });
    await sails.helpers.updateAndPublish.with({
      model: Operation,
      previous,
      data,
      req
    });
    res.ok(data);
  },

  async create(req, res) {
    let data = await sails.helpers.getReqRecord(Operation, req);
    await sails.helpers.performOperation.with({
      account: data.account,
      amount: data.amount,
      isDeposit: data.isDeposit || false
    });
    let newInstance = await sails.helpers.createAndPublish.with({
      model: Operation,
      req,
      data
    });
    // Operation.create(data).meta({fetch: true}).exec(function created (err, newInstance) {

    //   if (err) {
    //     switch (err.name) {
    //       case 'AdapterError':
    //         switch (err.code) {
    //           case 'E_UNIQUE': return res.badRequest(err);
    //           default: return res.serverError(err);
    //         }//•
    //       case 'UsageError': return res.badRequest('Usage Error');
    //       default: return res.serverError(err);
    //     }
    //   }

    //   if (req._sails.hooks.pubsub) {
    //     if (req.isSocket) {
    //       Operation.subscribe(req, [newInstance.id]);
    //       Operation._introduce(newInstance);
    //     }
    //     Operation._publishCreate(newInstance, !req.options.mirror && req);
    //   }
      // Send response
    res.ok(newInstance);
  }
};


