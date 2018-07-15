/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {

  async create( req, res ) {
    let data = await sails.helpers.getReqRecord( Operation, req );
    //Validations
    if ( !data.account )
    { return res.badRequest( sails.helpers.error( 'accountRequired' )); }
    if ( !data.amount || data.amount < 0 )
    { return res.badRequest( sails.helpers.error( 'amountRequired' )); }
    if ( !data.date )
    { return res.badRequest( sails.helpers.error( 'dateRequired' )); }
    if ( !data.isDeposit && !data.budget )
    { return res.badRequest( sails.helpers.error( 'budgetRequired' )); }
    if ( data.isDeposit && data.budget )
    { return res.badRequest( sails.helpers.error( 'mostNotHaveBudget' )); }


    if ( data.isDeposit ){
      await sails.helpers.performIncome.with({
        model: Account,
        id: data.account,
        amount: data.amount
      });
    } else {
      let operation = await sails.helpers.validateOperation.with({
        model: Account,
        id: data.account,
        amount: data.amount
      }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'account' ));
      let budOperation = await sails.helpers.validateOperation.with({
        model: Budget,
        id: data.budget,
        amount: data.amount
      }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'budget' ));
      await sails.helpers.updateAndPublish.with( operation );
      await sails.helpers.updateAndPublish.with( budOperation );
    }
    let newInstance = await sails.helpers.createAndPublish.with({
      model: Operation,
      req,
      data
    });
    res.ok( newInstance );
  },

  async update( req, res ){
    let data = await sails.helpers.getReqRecord( Operation, req );
    let previous = await Operation.findOne( data.id );
    let changes = [];
    Object.getOwnPropertyNames( data ).forEach(( prop ) => {
      if ( prop === 'id' ) { return false; }
      if ( data[prop] !== previous[prop]) { changes.push( prop ); }
    });
    let operation;
    let budOperation;
    let newOperation;
    let newBudOperation;
    try{
      if ( changes.includes( 'isDeposit' )){
        throw sails.helpers.error( 'cannotUpdateIsDeposit' );
      }
      // if only amount changed
      if ( changes.includes( 'amount' ) && !changes.includes( 'account' )){
        operation = await sails.helpers.validateOperation.with({
          model: Account,
          id: data.account || previous.account,
          amount: data.amount,
          rollback: previous.amount
        }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'account' ));
      }
      if ( changes.includes( 'account' )){
        operation = await sails.helpers.validateOperation.with({
          model: Account,
          id: previous.account,
          amount: previous.amount,
          substraction: previous.isDeposit
        }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'account' ));
        newOperation = await sails.helpers.validateOperation.with({
          model: Account,
          id: data.account,
          amount: data.amount || previous.amount,
          substraction: !previous.isDeposit
        }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'account' ));
      }
      if ( changes.includes( 'budget' )){
        budOperation = await sails.helpers.validateOperation.with({
          model: Budget,
          id: previous.budget,
          amount: previous.amount,
          substraction: false
        }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'budget' ));
        newBudOperation = await sails.helpers.validateOperation.with({
          model: Budget,
          id: data.budget,
          amount: data.amount || previous.amount,
        }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'budget' ));
      }
      if ( operation ) { await sails.helpers.updateAndPublish.with( operation ); }
      if ( newOperation ) { await sails.helpers.updateAndPublish.with( newOperation ); }
      if ( budOperation ) { await sails.helpers.updateAndPublish.with( budOperation ); }
      if ( newBudOperation ) { await sails.helpers.updateAndPublish.with( newBudOperation ); }
      let response = await sails.helpers.updateAndPublish.with({
        model: Operation,
        previous,
        data,
        req
      });
      res.ok( response );
    } catch ( err ){
      return res.badRequest( err );
    }
  },

  async destroy( req, res ){
    let data = await sails.helpers.getReqRecord( Operation, req );
    let previous = await Operation.findOne( data.id );
    if ( previous.destination ){
      await sails.helpers.transfer.with({
        model: Account,
        origin: previous.destination,
        destination: previous.account,
        amount: previous.amount
      });
    } else {
      let accountData = {
        model: Account,
        id: previous.account,
        amount: previous.amount
      };
      if ( previous.isDeposit ){
        let substraction = await sails.helpers.validateOperation.with( accountData )
          .intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( 'account' ));
        await sails.helpers.updateAndPublish.with( substraction );
      } else {
        await sails.helpers.performIncome.with( accountData );
        if ( previous.budget ) {
          await sails.helpers.performIncome.with({
            model: Budget,
            id: previous.budget,
            amount: previous.amount
          });
        }
      }
    }
    await sails.helpers.destroyAndPublish.with({
      model: Operation,
      id: data.id,
      req,
    });
    res.ok( previous );
  }

};


