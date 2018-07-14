const assert = require( 'chai' ).assert;
const supertest = require( 'supertest' );
let operation = {
  date: new Date(),
  isDeposit:false,
  budget:1,
  account:1,
  category:1,
  description: 'some description'
};
describe( 'Operation Controller', () => {
  describe.skip( 'create()', () => {
    describe( 'happy path', () => {
      before( async () => {
        operation.amount = 500;
        operation.id = 1;
        await Operation.create( operation );
      });
      it( 'discounts from the account', async () => {
        let account = await Account.findOne( 1 );
        assert.equal( account.balance, 500 );
      });
      it( 'discounts from the budget' );
    });
  });

  describe( 'update()', () => {
    describe( 'with amount change', () => {
      beforeEach( async() => {
        await Operation.destroy( 1 );
        let x = await Account.update( 1, { balance:1000 }).fetch();
      });
      it( 'res ok with all the proper fields updated', ( done ) => {
        operation.amount = 0;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ amount: 300 })
          .expect( 200 )
          .end(( err, res ) => {
            assert.notExists( err );
            assert.equal( res.body[0].id, 1 );
            assert.equal( res.body[0].account, 1 );
            assert.equal( res.body[0].budget, 1 );
            assert.equal( res.body[0].category, 1 );
            assert.equal( res.body[0].description, 'some description' );
            assert.equal( res.body[0].amount, 300 );
            assert.equal( res.body[0].destination, 0 );
            assert.equal( res.body[0].isDeposit, false );

            Operation.findOne( 1 ).then(( op ) => {
              assert.equal( res.body[0].id, 1 );
              assert.equal( op.account, 1 );
              assert.equal( op.budget, 1 );
              assert.equal( op.category, 1 );
              assert.equal( op.description, 'some description' );
              assert.equal( op.amount, 300 );
              assert.equal( op.destination, 0 );
              assert.equal( op.isDeposit, false );
            });
            done();
          });
        });
      });
      it( 'account amount updated correctly', ( done ) => {
        operation = Object.assign ({}, operation );
        operation.amount = 0;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ amount: 300 })
          .expect( 200 )
          .end(( err ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 700 );
              done();
            });
          });
        });
      });
      it( 'throws error when higher that available balance', ( done ) => {
        operation = Object.assign ({}, operation );
        operation.amount = 0;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ amount: 2000 })
          .expect( 400 )
          .end(( err, res ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1000 );
              assert.equal( res.body.code, 'accountInsufficientFunds' );
              done();
            });
          });
        });
      });
    });
    describe( 'with isDeposit Change', () => {
      beforeEach( async() => {
        await Operation.destroy( 1 );
        let x = await Account.update( 1, { balance:1000 }).fetch();
      });
      it( 'throws when trying to change isDeposit', ( done ) => {
        operation = Object.assign ({}, operation );
        operation.amount = 0;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ isDeposit: true })
          .expect( 400 )
          .end(( err, res ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1000 );
              console.log( res.body );
              assert.equal( res.body.code, 'cannotUpdateIsDeposit' );
              done();
            });
          });
        });
      });
    });
    describe( 'with budget change', () => {
      it( 'res ok changes to new budget' );
      it( 'throws if origin budget insufficient funds' );
    });
    describe( 'with account change', () => {
      it( 'res ok when extraction changing account' );
      it( 'res ok when deposit changing account' );
      it( 'throws if extraction destination insufficient funds ' );
      it( 'throws if deposit origin insufficient funds ' );
    });
  });
});
