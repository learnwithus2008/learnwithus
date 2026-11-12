import assert from "assert";
import {
  getLocalDoubtBalance,
  getLocalTickets,
  saveLocalTickets,
  submitDoubtRequest,
  markDoubtAsSolved,
  dismissDoubtTicket,
  DEFAULT_FREE_DOUBTS,
  DOUBT_COST_INR
} from "../src/services/doubtService.js";

console.log("===============================================================");
console.log("🧪 TESTING SAFE DOUBT LIFECYCLE (Count only reduces when solved)");
console.log("===============================================================");

// Mock environment
const storage = {};
global.window = {
  open: () => {}
};
global.localStorage = {
  getItem: (key) => storage[key] ?? null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

const testUser = "user_student_456";
const userDetails = { name: "Ravi Kumar", email: "ravi@example.com" };

// 1. Initial State
let balance = getLocalDoubtBalance(testUser);
console.log("Initial Balance:", balance);
assert.strictEqual(balance.doubtCredits, 10, "Student must start with 10 free doubts");
assert.strictEqual(balance.doubtsUsed, 0, "Doubts used must be 0");
assert.strictEqual(balance.pendingCount, 0, "Pending count must be 0");
console.log("✅ Step 1: Student starts with 10 free doubts.");

// 2. Student clicks 'Ask Doubt on WhatsApp' -> Submits pending ticket
const req1 = await submitDoubtRequest(testUser, userDetails, {
  sectionTitle: "Python Basics",
  lessonName: "What is Python?",
  question: "Why do we use Python instead of C++?"
});

balance = getLocalDoubtBalance(testUser);
console.log("Balance after sending WhatsApp message:", balance);
// CRITICAL CHECK: Doubt count must NOT be reduced!
assert.strictEqual(balance.doubtCredits, 10, "Doubt credits MUST NOT be reduced when sending WhatsApp message!");
assert.strictEqual(balance.pendingCount, 1, "Pending count must be 1");
assert.strictEqual(balance.doubtsUsed, 0, "Doubts used must still be 0");
console.log("✅ Step 2: WhatsApp opened and ticket DBT created. Count remains 10 (NOT reduced).");

// 3. Student asks a 2nd doubt before 1st is solved
const req2 = await submitDoubtRequest(testUser, userDetails, {
  sectionTitle: "Python Basics",
  lessonName: "Variables & Types",
  question: "How does dynamic typing work?"
});

balance = getLocalDoubtBalance(testUser);
assert.strictEqual(balance.doubtCredits, 10, "Doubt credits MUST STILL be 10!");
assert.strictEqual(balance.pendingCount, 2, "Pending count must be 2");
console.log("✅ Step 3: Second doubt asked. Count is STILL 10 (NOT reduced).");

// 4. Admin marks 1st ticket as SOLVED!
console.log(`Solving ticket #${req1.ticket.ticket_number} as Admin...`);
const solveRes = await markDoubtAsSolved(req1.ticket.id, {
  email: "mentor@learnwithus.com",
  notes: "Explained dynamic vs static typing and memory model on WhatsApp"
});

balance = getLocalDoubtBalance(testUser);
console.log("Balance after Admin solves ticket 1:", balance);
assert.strictEqual(balance.doubtCredits, 9, "Doubt credits MUST now be 9 after issue is solved by Admin");
assert.strictEqual(balance.doubtsUsed, 1, "Doubts used must now be 1");
assert.strictEqual(balance.pendingCount, 1, "1 ticket remains pending");
console.log("✅ Step 4: Admin solved issue. Student count is NOW reduced to 9!");

// 5. Admin dismisses/cancels 2nd ticket (e.g. duplicate or student cancelled)
console.log(`Dismissing ticket #${req2.ticket.ticket_number} as Admin...`);
await dismissDoubtTicket(req2.ticket.id, "Student resolved themselves");

balance = getLocalDoubtBalance(testUser);
assert.strictEqual(balance.doubtCredits, 9, "Doubt credits must remain 9 (dismissed tickets DO NOT reduce count)");
assert.strictEqual(balance.pendingCount, 0, "No pending tickets remain");
console.log("✅ Step 5: Dismissed ticket did NOT reduce student count. Still 9 doubts left.");

console.log("===============================================================");
console.log("🎉 ALL TESTS PASSED! User doubt count is strictly protected until Admin solves the issue!");
console.log("===============================================================");
