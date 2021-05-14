//Front End
import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';

(async () => {
  const stdlib = await loadStdlib();
  const startingBalance = stdlib.parseCurrency(10);

  const acc = await stdlib.newTestAccount(startingBalance);

//setting the Balance
  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
  const before = await getBalance(acc);

  const amIDeploying = 
    await ask('Are you deploying?' , yesno);
  const getInfo = async () => {
    return await ask(`Please paste the contract info`, JSON.parse);
  };
  const ctc = 
    amIDeploying ? 
  acc.deploy(backend) :
  acc.attach(backend, await getInfo());

  console.log(`The contract information is: ${JSON.stringify(await ctc.getInfo())}`);

  const HAND = ['Rock', 'Paper', 'Scissors'];
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
  const HANDS = {
    'Rock': 0, 'R': 0, 'r': 0,
    'Paper': 1, 'P': 1, 'p': 1,
    'Scissors': 2, 'S': 2, 's': 2,
  };

  //Setting up which hand to play and choosing which to play from the `const HAND = {}` table
  const interact = { ...stdlib.hasRandom };
  interact.getHand = async () => {
    const hand = await ask(`What hand will you play?`, (x) => {
      const hand = HANDS[x];
      if ( hand == null ) {
        throw Error(`Invalid hand: ${hand}`);
      }
      return hand;
    });
    console.log(`You played ${HAND[hand]}`);
    return hand;
  };
  interact.seeOutcome = (outcome) => { 
    console.log(`You saw outcome ${OUTCOME[outcome]}`);
  };
  interact.informTimeout = () => {
    console.log(`You saw a timeout`);
  };

  const amIAlice = 
    await ask(`Are You Alice?`, yesno);
  
  let which;
  if ( amIAlice ) {
    interact.wager = stdlib.parseCurrency(5);
    which = backend.Alice;
  } else {
    interact.acceptWager = async (wager) => {
      if ( await ask(`Do you accept the wager of ${fmt(wager)}?`, yesno) ) {
        return;
      } else {
        Process.exit(1);
      }  
   //An error pops up here, maybe create a message that states `Player doesn't accept wager'   
    };
    which = backend.Bob;
  }

  await which( ctc, interact );

  const after = await getBalance(acc);
  console.log(`You went from ${before} to ${after}.`); 

  done();
})();   
