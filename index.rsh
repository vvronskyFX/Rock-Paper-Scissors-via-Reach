'reach 0.1';

const [ isHand, ROCK, PAPER, SCISSORS ] = makeEnum(3);
const [ isOutcome, B_WINS, DRAW, A_WINS ] = makeEnum(3);

const winner = (handA, handB) =>
      (handA + (4 - handB)) % 3;

assert(winner(ROCK, PAPER) == B_WINS);
assert(winner(PAPER, ROCK) == A_WINS);
assert(winner(ROCK, ROCK) == DRAW);


const Player =
      { 
        ...hasRandom,
        getHand: Fun([], UInt),
        seeOutcome: Fun([UInt], Null),
        informTimeout: Fun([], Null)
      };

const DELAY = 5;

const Alice =
      { ...Player,
        wager: UInt };
const Bob =
      { ...Player,
        acceptWager: Fun([UInt], Null) };

export const main =
  Reach.App(
    // Compilation options
    {},
    // The set of Participants 
    [Participant('Alice', Alice), Participant('Bob', Bob)],
    // The Body of the Application
    (A, B) => {
      const informTimeout = () =>
        each ([A, B], () => {
         interact.informTimeout(); });

      A.only(() => {
        const wager = declassify(interact.wager);
      }); 
      A.publish(wager)
          .pay(wager);
      commit();
  
      B.only(() => {
        interact.acceptWager(wager);
      });
      B.pay(wager)
       .timeout(DELAY, () => closeTo(A, informTimeout));
         //commit(); <-- Removed so we can start the while loop
     //Loop  
   var outcome = DRAW; 
   invariant(balance() == 2 * wager );
   while ( outcome == DRAW ) {
     commit(); // <--- This is the commit we moved before 

      A.only(() => {
        const _handA = interact.getHand(); 
        const [ _commitA, _saltA ] = makeCommitment(interact, _handA);
        const commitA = declassify(_commitA);
      });
      A.publish(commitA)
       .timeout(DELAY, () => closeTo(B, informTimeout));
      commit();

      unknowable(B, A(_handA, _saltA));
      B.only(() => {
        const handB = declassify(interact.getHand()); 
      });
      B.publish(handB)
       .timeout(DELAY, () => closeTo(A, informTimeout));
         commit();

      A.only(() => {
      const [ handA, saltA ]  = declassify([_handA, _saltA]); 
      });
      A.publish(handA, saltA)
       .timeout(DELAY, () => closeTo(B, informTimeout));
      checkCommitment(commitA, saltA, handA);

      outcome = winner(handA, handB);
      continue;
      }
      
      assert(outcome != DRAW);

      transfer(2 * wager).to(outcome == B_WINS ? B : A );
      commit();

      each([A, B], () => {
        interact.seeOutcome(outcome); });
      exit(); });
