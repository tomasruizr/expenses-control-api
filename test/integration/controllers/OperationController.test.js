const assert = require('chai').assert;
const supertest = require('supertest');

describe('Operation Controller', () => {

  describe('update()', () => {
    describe('with amount change', () => {
      it('res ok when higher amount');
      it('res ok when lower amount');
      it('throws error when higher that available balance');
    });
    describe('with isDeposit Change', () => {
      it('throws when trying to change isDeposit');
    });
    describe('with budget change', () => {
      it('res ok changes to new budget');
      it('throws if origin budget insufficient funds');
    });
    describe('with account change', () => {
      it('res ok when extraction changing account');
      it('res ok when deposit changing account');
      it('throws if extraction destination insufficient funds ');
      it('throws if deposit origin insufficient funds ');
    });




  });

});
