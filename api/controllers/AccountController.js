/**
 * AccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async makeTransfer(req, res){
    let data = req.body;
    await sails.helpers.transfer.with({
      model: Account,
      origin: data.origin,
      destination: data.destination,
      amount: data.amount
    });
    let newInstance = await sails.helpers.createAndPublish.with({
      model: Operation,
      req,
      data: {
        account: data.origin,
        destination: data.destination,
        amount: data.amount,
        description: data.description
      }
    });
    res.ok(newInstance);
  },

};

