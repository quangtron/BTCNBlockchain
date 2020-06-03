class Block {
  constructor (index, previousHash, timestamp, data, hash, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.nonce = nonce;
  }

  static get genesis() {
    return new Block(
      0,
      "0",
      1589811488,
      [genesisTransaction],
      "000c97bd45f422c2d13414a82e90d0ad4a4d4e3634fa6555d8ebdeaec3b128c0",
      1852
    );
  }
}

const genesisTransaction = {
  'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
  'txOuts': [{
      'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
      'amount': 50
  }],
  'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};


module.exports = Block;