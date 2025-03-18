# Testnet generator
Make your own bitcoin testnet

# What is this?

When you click [this link](https://supertestnet.github.io/testnet_generator/) you'll generate your own bitcoin testnet. You get to mine a block by clicking a button, you get 50 fake bitcoins whenever you do, you can send those fake bitcoins to other people and receive them from them, and you can explore your chain by clicking blocks, transactions, and addresses.

# How can I try it?

Just click here: https://supertestnet.github.io/testnet_generator/

# Why did you make this?

To alleviate three of my frustrations with existing testnet solutions.

## #1: Rate limits

One is a frustration with testnet faucets, which always have a "rate limiting" problem. That is, every testnet faucet has to choose between one of two bad options: if a testnet faucet *doesn't* limit how often or how much money users can take from it per-click, then trolls will spam it til it runs out of money, whereupon it won't be useful to anyone. But if it *does* limit one or both of those things, then users who are rapidly testing their software will soon hit the rate limit, and then their progress slows down.

Testnet generator fixes this problem by having the blockchain be lightweight enough that you can run it and all associated infrastructure (including a faucet) directly in your browser. That way, you can only spam yourself, so you don't need to guard against that, meaning you don't need rate limits.

## #2: Slow blocks

Another frustration I have is with blocks that come too slowly. Most testnets use the same 10 minute blocktime bitcoin uses. Some are more "generous" and reduce the blocktime to 30 seconds. But that's not always good enough. If I'm testing something like a lightning force closure, you have to wait 2016 blocks before finalizing, and even with 30 second blocks, that means waiting about 17 hours to finalize the force closure. Too long. 

Testnet generator fixes this problem by giving you a button to insta-mine a block. That way, if you need to wait 2016 blocks, you can just rapid-fire click it a couple thousand times and be on your way. (I should probably ease this further by adding a dropdown that lets you specify how many blocks you want to mine per click.)

## #3: Regtest sucks

Another frustration I have is with bitcoin's "regtest" mode. When testing my software I often use that *instead of* testnets, largely because there's a command you can use to insta-mine as many blocks as you like. But regtest mode has several quirks: it's kind of a pain to get it started because, not only do you have to download and configure bitcoin core to run in that mode, but you also can't start testing apps immediately, you have to mine 101 blocks first due to one of bitcoin's consensus rules regarding mining. Also, if you get something to work on regtest, you can't easily share what you've done on social media by e.g. sharing a link, because your regtest node is likely not exposed to the public internet, and even if it was, regtest mode *looks ugly* and confusing, so no one would like it if you shared your work that way.

Testnet generator fixes these problems by (1) eliminating the consensus rule that makes you mine 101 blocks, (2) creating a lightweight blockchain directly in your browser so you don't have to download or configure anything, (3) looking nice enough (with lots of pretty colors) that you can feel good about sharing links to this stuff on social media. (Links to blocks and transactions are a work in progress though, so you can't do that part yet.)

# So you put a blockchain in a browser?

Yes. Every time you visit the website you spin up a new blockchain just for you. It shares a lot of bitcoin's consensus rules too, so you can use it for testing bitcoin apps.

Also...technically, no, this isn't a blockchain, it just looks and acts like one. In a "real" blockchain, later blocks commit to prior blocks, and each one contains proof that it costed something to produce. That way, the cost of doublespending a transaction grows as the transaction gets "buried" under more blocks, because you have to re-pay to create all of the blocks "on top" of it or no one will accept your doublespend. The "blockchain" in this software doesn't do any of that. It's expected to be used in an environment where the person mining the blocks is the only user, and creating blocks is supposed to be free. In that environment, the miner doesn't need to prove anything to anyone, so later blocks don't need to commit to prior blocks, which means this isn't technically a real blockchain. But it's close enough for what I want to do with it.

# There's no way this testnet is the same as bitcoin

It's not, it's missing lots of important consensus rules. For example, there's no blocksize limit, there are no halvings (so coins are theoretically unlimited), there's no proof of work, there's no difficulty adjustment, there's no 100-block "waiting period" applied to freshly mined coins, later blocks don't commit to prior blocks, transactions are not merkelized, there's no concept of "median time past" (so blocks can have any timestamp), and this blockchain only understands how to validate transactions that exclusively spend segwit v1 utxos (i.e. taproot outputs) -- segwit v0 and legacy utxos are not supported. They're too old-fashioned. There are also *consequences* to the above things, e.g. due to there not being a blocksize limit, fees are always low (1 sat per byte) -- you don't need to compete with people to get into a block when there's no blocksize limit.

# Sounds like you omitted everything that makes bitcoin bitcoin. So what in the world is this thing?

I didn't omit *everything.* This "blockchain" uses the same transaction format as bitcoin, the same elliptic curve, the same signature format, the same utxo model, and it understands bitcoin script, taproot, and bitcoin's sighash schemes. This means you can create transactions which validly spend utxos in this software with confidence that you can run the same code on bitcoin to spend "real" utxos, unless you specifically design a transaction to rely on one of the consensus rules that this software omits.
