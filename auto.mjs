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
  const ctc = 
    amIDeploying ? 
  acc.deploy(backend) :
  acc.attach(backend, await getInfo());

  const HAND = ['Rock', 'Paper', 'Scissors'];
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
  
  const interact = { ...stdlib.hasRandom };
  interact.getHand = async () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`You played ${HAND[hand]}`);
    return hand;
  };
  interact.seeOutcome = (outcome) => { 
    console.log(`You saw outcome ${OUTCOME[outcome]}`);
  };
  interact.informTimeout = () => {
    console.log(`You saw a timeout`);
  };
  
  let which;
  if ( amIAlice ) {
    interact.wager = stdlib.parseCurrency(5);
    which = backend.Alice;
  } else {
    interact.acceptWager = async (wager) => {
      console.log(`Bob accepts the wager of ${fmt(wager)}.`);
    };
    which = backend.Bob;
  }
 
  await which( ctc, interact );

  const after = await getBalance(acc);
  console.log(`You went from ${before} to ${after}.`); 

  done();
 })();   
