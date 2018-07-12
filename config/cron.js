module.exports.cron = {
  crons() {
    return [
      {
        // Resets budget every month
        interval: '* * * 1 * *',
        method: async () => {
          let budgets = await Budget.find({isActive:true});
          budgets.forEach((budget) => {
            budget.balance += budget.amount;
          });
        }
      }
    ];
  },
};
