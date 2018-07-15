const assert = require( 'chai' ).assert;
const supertest = require( 'supertest' );
describe( 'Budget Controller', () => {
  describe( 'makeTransfer()', () => {
    beforeEach( async () => {
      await Budget.update( 1, { balance: 1000 });
      await Budget.update( 2, { balance: 500 });
    });
    it( 'transfer the amount between budgets', ( done ) => {
      supertest( sails.hooks.http.app )
        .post( '/operation/makeTransfer' )
        .send({
          type: 'Budget',
          origin: 1,
          destination: 2,
          amount: 200
        })
        .end(( err ) => {
          assert.notExists( err );
          Budget.findOne( 1 ).then(( budget ) => {
            assert.equal( budget.balance, 800 );
            Budget.findOne( 2 ).then(( budget ) => {
              assert.equal( budget.balance, 700 );
              done();
            }).catch( err=>done( err ));
          }).catch( err=>done( err ));
        });
    });
    it( 'throws if origin budget has insufficient funds', ( done ) => {
      supertest( sails.hooks.http.app )
        .post( '/operation/makeTransfer' )
        .send({
          type: 'Budget',
          origin:1,
          destination:2,
          amount: 2000
        })
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'budgetInsufficientFunds' );
          Budget.findOne( 1 ).then(( budget ) => {
            assert.equal( budget.balance, 1000 );
            Budget.findOne( 2 ).then(( budget ) => {
              assert.equal( budget.balance, 500 );
              done();
            }).catch( err=>done( err ));
          }).catch( err=>done( err ));
        });
    });
  });
});
