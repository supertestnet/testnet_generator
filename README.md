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

Testnet generator fixes this problem by giving you a button to insta-mine a block. That way, if you need to wait 2016 blocks, you can just rapid-fire click it a couple thousand times and be on your way. (I should probably ease this further by adding a form that lets you specify how many blocks you want to mine per click.)

## #3: Regtest sucks

Another frustration I have is with bitcoin's "regtest" mode. When testing my software I often use that *instead of* testnets, largely because there's a command you can use to insta-mine as many blocks as you like. But regtest mode has several quirks: it's kind of a pain to get it started because, not only do you have to download and configure bitcoin core to run in that mode, but you also can't start testing apps immediately, you have to mine 101 blocks first due to one of bitcoin's consensus rules regarding mining. Also, if you get something to work on regtest, you can't easily share what you've done on social media by e.g. sharing a link, because your regtest node is likely not exposed to the public internet, and even if it was, regtest mode *looks ugly* and confusing, so no one would like it if you shared your work that way.

Testnet generator fixes these problems by (1) eliminating the consensus rule that makes you mine 101 blocks, (2) creating a lightweight blockchain directly in your browser so you don't have to download or configure anything, (3) looking nice enough (with lots of pretty colors) that you can feel good about sharing links to this stuff on social media. (Links to blocks and transactions are a work in progress though, so you can't do that part yet.)

# So you put a blockchain in a browser?

Yes. Every time you visit the website you spin up a new blockchain just for you. It shares a lot of bitcoin's consensus rules too, so you can use it for testing bitcoin apps.

# There's no way this testnet is the same as bitcoin

It's not, it's missing several important consensus rules. For example: there's no blocksize limit, there's no difficulty or difficulty adjustment, there's no 100-block "waiting period" applied to freshly mined coins, and this blockchain only understands how to validate transactions that exclusively spend segwit v1 utxos (i.e. taproot outputs) -- segwit v0 and legacy utxos are not supported. They're too old-fashioned. There are also *consequences* to the above things, e.g. due to there not being a blocksize limit, fees are always minimized to 1 sat per byte -- you don't need to compete with people to get into a block.
