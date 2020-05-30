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
        "Welcome to Blockchain Demo 2.0!",
        "000c97bd45f422c2d13414a82e90d0ad4a4d4e3634fa6555d8ebdeaec3b128c0",
        1852
      );
    }
  }
  
  module.exports = Block;