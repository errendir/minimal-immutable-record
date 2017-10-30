# Minimal immutable record

Hash trie records implemented by immutable.js can be improved by assuming:
- The keys don't need to be hashed to find their place in the trie. Fixed positions can be used since all the keys are known when the record class is created.
- If a large number of records is never updated there is no need to create the trie until the first `.set` call. This can save both memory and computations.


#### TODO:
- Add the ability to delete keys (make the behaviour equal to the one of immutable.js)
- Make the length of hash fragments configurable
- Compare the performance agains the naive record that copies the underlying object

#### Direction to explore:
- Maybe for records with small number of keys it's not worth using the Hash Trie at all and the Naive Record has the best performance. Investigate the performance for records of different sizes.
- If `.get` calls are more frequent than `.set` calls, it might be worth caching the results of `.get` calls in a `Map` that doesn't propagate to any copy of the Record instance
- Investigate the best hash fragment length for a given size of the record
- ??? adjust the trie structure to put the most frequently updated fields at a shallow depth
