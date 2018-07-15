const assert = require( 'chai' ).assert;
const supertest = require( 'supertest' );
let operation;
let operationOrig = {
  date: new Date(),
  isDeposit:false,
  budget:1,
  account:1,
  category:1,
  description: 'some description'
};
describe( 'Operation Controller', () => {
  describe( 'create()', () => {
    beforeEach( async() => {
      await Operation.destroy( 1 );
      await Account.update( 1, { balance: 1000 });
      await Budget.update( 1, { balance: 1000 });
    });
    describe( 'happy path', () => {
      it( 'discounts from the account', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 200 )
        .end(( err ) => {
          assert.notExists( err );
          Account.findOne( 1 ).then(( account ) => {
            assert.equal( account.balance, 800 );
            done();
          }).catch( err=>done( err ));
        });
      });
      it( 'discounts from the budget', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 200 )
        .end(( err ) => {
          assert.notExists( err );
          Budget.findOne( 1 ).then(( budget ) => {
            assert.equal( budget.balance, 800 );
            done();
          }).catch( err=>done( err ));
        });
      });
    });
    describe( 'exceptions', () => {
      it( 'demands account', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        delete operation.account;
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'accountRequired' );
          done( err );
        });
      });
      it( 'demands date', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        delete operation.date;
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'dateRequired' );
          done( err );
        });
      });
      it( 'demands amount', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'amountRequired' );
          done( err );
        });
      });
      it( 'demands budget when expense', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        delete operation.budget;
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'budgetRequired' );
          done( err );
        });
      });
      it( 'rejects budget when deposit', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        operation.isDeposit = true;
        supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'mostNotHaveBudget' );
          done( err );
        });
      });
    });
  });

  describe( 'update()', () => {
    describe( 'with amount change', () => {
      beforeEach( async() => {
        await Operation.destroy( 1 );
        await Account.update( 1, { balance: 1000 });
      });
      it( 'res ok with all the proper fields updated', ( done ) => {
        operation = Object.assign ({}, operationOrig );
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
              assert.equal( op.id, 1 );
              assert.equal( op.account, 1 );
              assert.equal( op.budget, 1 );
              assert.equal( op.category, 1 );
              assert.equal( op.description, 'some description' );
              assert.equal( op.amount, 300 );
              assert.equal( op.destination, 0 );
              assert.equal( op.isDeposit, false );
            }).catch( err=>done( err ));
            done();
          });
        });
      });
      it( 'account amount updated correctly', ( done ) => {
        operation = Object.assign ({}, operationOrig );
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
            }).catch( err=>done( err ));
          });
        });
      });
      it( 'throws error when higher that available balance', ( done ) => {
        operation = Object.assign ({}, operationOrig );
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
            }).catch( err=>done( err ));
          });
        });
      });
    });
    describe( 'with isDeposit Change', () => {
      beforeEach( async() => {
        await Operation.destroy( 1 );
      });
      it( 'throws when trying to change isDeposit', ( done ) => {
        operation = Object.assign ({}, operationOrig );
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
              assert.equal( res.body.code, 'cannotUpdateIsDeposit' );
              done();
            }).catch( err=>done( err ));
          });
        });
      });
    });
    describe( 'with budget change', () => {
      beforeEach( async() => {
        await Operation.destroy( 1 );
        await Account.update( 1, { balance: 1000 });
        await Budget.update( 1, { balance: 1000 });
        await Budget.update( 2, { balance: 500 });
      });
      it( 'res ok changes to new budget', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 300;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ budget: 2 })
          .expect( 200 )
          .end(( err, res ) => {
            assert.notExists( err );
            Budget.findOne( 1 ).then(( budget ) => {
              assert.equal( budget.balance, 1300 );
            }).then(() => {
              Budget.findOne( 2 ).then(( budget2 ) => {
                assert.equal( budget2.balance, 200 );
                done();
              });
            }).catch( err=>done( err ));
          });
        });
      });
      it( 'throws if origin budget insufficient funds', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 600;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ budget: 2 })
          .expect( 400 )
          .end(( err, res ) => {
            assert.notExists( err );
            assert.equal( res.body.code,'budgetInsufficientFunds' );
            Budget.findOne( 1 ).then(( budget ) => {
              assert.equal( budget.balance, 1000 );
            }).then(() => {
              Budget.findOne( 2 ).then(( budget2 ) => {
                assert.equal( budget2.balance, 500 );
                done();
              });
            }).catch( err=>done( err ));
          });
        });
      });
    });
    describe( 'with account change', () => {
      beforeEach( async () => {
        await Operation.destroy( 1 );
        await Account.update( 1, { balance: 1000 });
        await Account.update( 2, { balance: 500 });
        await Budget.update( 1, { balance: 1000 });
      });
      it( 'res ok when extraction changing account', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        operation.id = 1;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ account: 2 })
          .expect( 200 )
          .end(( err ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1200 );
            }).then(() => {
              Account.findOne( 2 ).then(( account ) => {
                assert.equal( account.balance, 300 );
                done();
              }).catch( err=>done( err ));
            });
          });
        });
      });
      it( 'res ok when deposit changing account', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 200;
        operation.id = 1;
        operation.isDeposit = true;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ account: 2 })
          .expect( 200 )
          .end(( err ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 800 );
            }).then(() => {
              Account.findOne( 2 ).then(( account ) => {
                assert.equal( account.balance, 700 );
                done();
              }).catch( err=>done( err ));
            });
          });
        });
      });
      it( 'throws if extraction destination insufficient funds ', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 600;
        operation.id = 1;
        operation.isDeposit = false;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ account: 2 })
          .expect( 400 )
          .end(( err, res ) => {
            assert.notExists( err );
            assert.equal( res.body.code, 'accountInsufficientFunds' );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1000 );
            }).then(() => {
              Account.findOne( 2 ).then(( account ) => {
                assert.equal( account.balance, 500 );
                done();
              }).catch( err=>done( err ));
            });
          });
        });
      });
      it( 'throws if deposit origin insufficient funds ', ( done ) => {
        operation = Object.assign ({}, operationOrig );
        operation.amount = 600;
        operation.id = 1;
        operation.account = 2;
        operation.isDeposit = true;
        Operation.create( operation ).then(() => {
          supertest( sails.hooks.http.app )
          .patch( '/operation/1' )
          .send({ account: 1 })
          .expect( 400 )
          .end(( err, res ) => {
            assert.notExists( err );
            assert.equal( res.body.code, 'accountInsufficientFunds' );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1000 );
            }).then(() => {
              Account.findOne( 2 ).then(( account ) => {
                assert.equal( account.balance, 500 );
                done();
              }).catch( err=>done( err ));
            });
          });
        });
      });
    });
  });

  describe( 'destroy()', () => {
    beforeEach( async () => {
      await Operation.destroy( 1 );
      await Account.update( 1, { balance: 1000 });
      await Budget.update( 1, { balance: 1000 });
    });
    it( 'restore the operation amount to the account', ( done ) => {
      operation = Object.assign ({}, operationOrig );
      operation.amount = 1000;
      operation.id = 1;
      supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .end(() => {
          supertest( sails.hooks.http.app )
          .delete( '/operation/1' )
          .send()
          .expect( 200 )
          .end(( err, res ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1000 );
              done();
            }).catch( err=>done( err ));
          });
        });
    });
    it( 'updates the restore the amount to the budget', ( done ) => {
      operation = Object.assign ({}, operationOrig );
      operation.amount = 500;
      operation.id = 1;
      supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .end(() => {
          supertest( sails.hooks.http.app )
          .delete( '/operation/1' )
          .send()
          .expect( 200 )
          .end(( err, res ) => {
            assert.notExists( err );
            Budget.findOne( 1 ).then(( budget ) => {
              assert.equal( budget.balance, 1000 );
              done();
            }).catch( err=>done( err ));
          });
        });
    });
    it( 'withdraw from the account when deleting deposit', ( done ) =>{
      operation = Object.assign ({}, operationOrig );
      operation.amount = 500;
      operation.id = 1;
      delete operation.budget;
      operation.isDeposit = true;
      supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .end(() => {
          supertest( sails.hooks.http.app )
          .delete( '/operation/1' )
          .send()
          .expect( 200 )
          .end(( err, res ) => {
            assert.notExists( err );
            Account.findOne( 1 ).then(( account ) => {
              assert.equal( account.balance, 1000 );
              done();
            }).catch( err=>done( err ));
          });
        });
    });
    it( 'withdraw from the budget when deleting deposit', ( done ) =>{
      operation = Object.assign ({}, operationOrig );
      operation.amount = 500;
      operation.id = 1;
      delete operation.budget;
      operation.isDeposit = true;
      supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .end(() => {
          supertest( sails.hooks.http.app )
          .delete( '/operation/1' )
          .send()
          .expect( 200 )
          .end(( err, res ) => {
            assert.notExists( err );
            Budget.findOne( 1 ).then(( budget ) => {
              assert.equal( budget.balance, 1000 );
              done();
            }).catch( err=>done( err ));
          });
        });
    });
    it( 'throw insufficient funds if deleting deposit from account', ( done ) => {
      operation = Object.assign ({}, operationOrig );
      operation.amount = 500;
      operation.id = 1;
      delete operation.budget;
      operation.isDeposit = true;
      supertest( sails.hooks.http.app )
        .post( '/operation' )
        .send( operation )
        .end(() => {
          Account.update( 1, { balance: 400 })
          .then(() => {
            supertest( sails.hooks.http.app )
            .delete( '/operation/1' )
            .send()
            .expect( 400 )
            .end(( err, res ) => {
              assert.notExists( err );
              assert.equal( res.body.code, 'accountInsufficientFunds' );
              Account.findOne( 1 ).then(( account ) => {
                assert.equal( account.balance, 400 );
                done();
              }).catch( err=>done( err ));
            });
          });
        });
    });
    it( 'throws error if trying to destroy transfer', ( done ) => {
      supertest( sails.hooks.http.app )
        .post( '/operation/makeTransfer' )
        .send({
          type: 'Account',
          origin:1,
          destination:2,
          amount: 200
        })
        .end(( err, res ) => {
          assert.notExists( err );
          supertest( sails.hooks.http.app )
          .delete( `/operation/${res.body.id}` )
          .send()
          .expect( 400 )
          .end(( err, res ) => {
            assert.notExists( err );
            assert.equal( res.body.code, 'cannotDeleteTransfer' );
            done();
          });
        });
    });
  });
  describe( 'transfer()', () => {
    beforeEach( async() => {
      await Account.update( 1, { balance: 1000 });
      await Account.update( 2, { balance: 500 });
      await Budget.update( 1, { balance: 1000 });
      await Budget.update( 2, { balance: 500 });
    });
    it( 'transfer the amount between accounts', ( done ) => {
      supertest( sails.hooks.http.app )
        .post( '/operation/makeTransfer' )
        .send({
          type: 'Account',
          origin:1,
          destination:2,
          amount: 200
        })
        .end(( err, res ) => {
          assert.notExists( err );
          Account.findOne( 1 ).then(( account ) => {
            assert.equal( account.balance, 800 );
            Account.findOne( 2 ).then(( account ) => {
              assert.equal( account.balance, 700 );
              done();
            }).catch( err=>done( err ));
          }).catch( err=>done( err ));
        });
    });
    it( 'throws if origin account has insufficient funds', ( done ) => {
      supertest( sails.hooks.http.app )
        .post( '/operation/makeTransfer' )
        .send({
          type: 'Account',
          origin:1,
          destination:2,
          amount: 2000
        })
        .expect( 400 )
        .end(( err, res ) => {
          assert.notExists( err );
          assert.equal( res.body.code, 'accountInsufficientFunds' );
          Account.findOne( 1 ).then(( account ) => {
            assert.equal( account.balance, 1000 );
            Account.findOne( 2 ).then(( account ) => {
              assert.equal( account.balance, 500 );
              done();
            }).catch( err=>done( err ));
          }).catch( err=>done( err ));
        });
    });
  });
});
