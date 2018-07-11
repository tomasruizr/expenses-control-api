/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  async create(req, res) {
    // function getNewRecord(){
    //   // Use all of the request params as values for the new record.
    //   var values = req.allParams();

    //   // Attempt to JSON parse any collection attributes into arrays.  This is to allow
    //   // setting collections using the shortcut routes.
    //   _.each(Operation.attributes, (attrDef, attrName) => {
    //     if (attrDef.collection && (!req.body || !req.body[attrName]) && (req.query && _.isString(req.query[attrName]))) {
    //       try {
    //         values[attrName] = JSON.parse(req.query[attrName]);
    //         // If it is not valid JSON (e.g. because it's just a normal string),
    //         // then fall back to interpreting it as-is
    //       } catch(unusedErr) {}

    //     }
    //   });

    //   return values;
    // }

    // Get the new record data.
    var data = sails.helpers.getReqRecord(Operation);

    // Perform the update to the account balance
    let success = await sails.helpers.performOperation.with({
      account: data.account,
      amount: data.amount,
      isDeposit: data.isDeposit || false
    });

    if (!success){
      return res.serverError(new Error('The server failed to perform the operation.'));
    }
    // Create new instance of model using data from params
    Operation.create(data).meta({fetch: true}).exec(function created (err, newInstance) {

      // Differentiate between waterline-originated validation errors
      // and serious underlying issues. Respond with badRequest if a
      // validation error is encountered, w/ validation info, or if a
      // uniqueness constraint is violated.
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
      }//-•

      // If we didn't fetch the new instance, just return 'OK'.
      // if (!newInstance) {
      //   console.log('no new instance');
      //   return res.ok();
      // }

      // Look up and populate the new record (according to `populate` options in request / config)

      // If we have the pubsub hook, use the model class's publish method
      // to notify all subscribers about the created item
      if (req._sails.hooks.pubsub) {
        if (req.isSocket) {
          console.log('se subscribio');
          Operation.subscribe(req, [newInstance.id]);
          Operation._introduce(newInstance);
        }
        Operation.publish([newInstance.id], newInstance, !req.options.mirror && req);
      }//>-

      // Send response
      res.ok(newInstance);

    });

  }
};


