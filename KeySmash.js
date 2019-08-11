function getRandIntFromRange(iLow, iHigh) {
  if (iHigh < iLow) return 0;
  return Math.round((iHigh - iLow) * Math.random() + iLow);
}

exports.Init = function Init(client, msg) {
  const length = getRandIntFromRange(10, 20);
  const smash = [];

  while (smash.length < length) {
    const tierchoose = getRandIntFromRange(32, 126);
    smash.push(String.fromCharCode(tierchoose));
  }

  const keysmash = smash.join("");

  const msgChannel = client.channels.get(msg.channel.id);
  msgChannel.send(keysmash);
};
