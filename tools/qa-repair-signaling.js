(async () => {
  const checks = [], check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const NativePC = window.RTCPeerConnection, created = [];
  let mode = "reject", resolveAnswer, resolveOffer;
  const board = () => ({ publications: [], closed: 0, publish(...args) { this.publications.push(args); }, close() { this.closed++; }, subscribe() {} });
  const channel = label => ({ label, readyState: "open", bufferedAmount: 0, messages: [], send(s) { this.messages.push(JSON.parse(s)); }, close() {} });
  class FakePC {
    constructor() { this.mode = mode; this.iceGatheringState = "complete"; this.localDescription = null; this.closed = false; this.localCalls = 0; created.push(this); }
    createDataChannel(label) { return channel(label); }
    async setRemoteDescription() { if (this.mode === "reject") throw Error("deliberate invalid SDP"); }
    createAnswer() { return this.mode === "delay-answer" ? new Promise(r => { resolveAnswer = r; }) : Promise.resolve({ type: "answer", sdp: "qa-answer" }); }
    createOffer() { return this.mode === "delay-offer" ? new Promise(r => { resolveOffer = r; }) : Promise.resolve({ type: "offer", sdp: "qa-offer" }); }
    async setLocalDescription(d) { this.localCalls++; this.localDescription = d; }
    close() { this.closed = true; }
  }
  const offer = JSON.stringify({ id: "fixture-offer", at: Date.now(), sdp: "fixture-sdp" });
  try {
    window.RTCPeerConnection = FakePC;
    NET.peers.clear(); NET.avatars.clear(); NET.role = "guest"; NET.joining = false; NET.code = "4826"; NET.gen++;
    const failedBoard = NET.board = board();
    await netBoardMessage(netTopic(NET.code, "h"), offer, NET.gen, failedBoard, NET.code);
    check(!NET.joining && NET.role === null && !NET.peers.has("host"), "rejected guest SDP clears joining state and failed peer");
    check(failedBoard.closed === 1 && NET.board === null, "failed guest negotiation closes its matchmaking socket");
    mode = "delay-answer"; NET.role = "guest"; NET.joining = false; NET.code = "4826"; NET.gen++;
    const oldBoard = NET.board = board(), gen = NET.gen;
    const pending = netBoardMessage(netTopic(NET.code, "h"), offer, gen, oldBoard, NET.code);
    for (let i = 0; i < 20 && !resolveAnswer; i++) await Promise.resolve();
    check(!!resolveAnswer, "guest negotiation reaches the awaited answer creation");
    const oldPeer = NET.peers.get("host"), newPeer = { id: "host", pc: { close() {} } };
    NET.gen++; const replacement = NET.board = board(); NET.code = "6248"; NET.peers.set("host", newPeer);
    resolveAnswer({ type: "answer", sdp: "late-answer" }); await pending;
    check(oldPeer.pc.closed && NET.peers.get("host") === newPeer && NET.board === replacement && replacement.closed === 0, "late guest negotiation closes only its own obsolete peer");
    check(oldBoard.publications.length === 0 && oldPeer.pc.localCalls === 0, "obsolete answer never advances negotiation or publishes through another attempt");
    mode = "delay-offer"; NET.peers.clear(); NET.role = "host"; NET.code = "4826"; NET.gen++;
    const hostBoard = NET.board = board(); const hostPending = netHostPublishOffer(NET.gen, hostBoard, NET.code); const obsolete = created[created.length - 1];
    NET.gen++; NET.board = board(); NET.code = "6248";
    resolveOffer({ type: "offer", sdp: "late-offer" }); await hostPending;
    check(obsolete.closed && obsolete.localCalls === 0 && hostBoard.publications.length === 0, "obsolete broker offer stops immediately after the first awaited operation");
    mode = "delay-offer"; NET.peers.clear(); NET.role = null;
    const manual = netHost(), oldManual = created[created.length - 1], finishManual = resolveOffer;
    mode = "complete"; await netHost(); const freshPeer = NET.pending, freshCode = netEl("mpOut").value;
    finishManual({ type: "offer", sdp: "obsolete-manual" }); await manual;
    check(oldManual.closed && NET.pending === freshPeer && netEl("mpOut").value === freshCode, "new manual invite supersedes old async work without overwriting its code");
    for (const p of [...NET.peers.values()]) netDiscardAttemptPeer(p);
    NET.role = "guest"; NET.joining = true; const openBoard = NET.board = board();
    const connected = netPeer("host"), ch = channel("game"); netWire(connected, ch); ch.onopen();
    check(connected.ready && openBoard.closed === 1 && !NET.board && !NET.joining, "guest data-channel open releases matchmaking and its keepalive");
    check(ch.messages.some(m => m.t === "hello"), "matchmaking cleanup preserves the normal hello handshake");
    const droppedBoard = NET.board = board();
    netDrop(connected);
    check(droppedBoard.closed === 1 && NET.board === null && NET.role === null, "final guest disconnect also clears a remaining matchmaking socket");
    return { total: checks.length, checks };
  } finally {
    window.RTCPeerConnection = NativePC;
    for (const p of [...NET.peers.values()]) { clearTimeout(p.joinTimeout); netDiscardAttemptPeer(p); }
    NET.peers.clear(); NET.avatars.clear(); NET.role = null; NET.board = null; NET.joining = false;
  }
})()
