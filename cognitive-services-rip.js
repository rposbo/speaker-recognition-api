function init(n) {
    sampleRate = n.sampleRate;
    numChannels = n.numChannels;
    initBuffers()
}
function record(n) {
    for (var o = sampleRate / 16e3, h = Math.round(n[0].length / o), i = new Float32Array(h), r = 0, s = 0, u, f, t, e; r < i.length; ) {
        for (u = Math.round((r + 1) * o),
        f = 0,
        e = 0,
        t = s; t < u && t < n[0].length; t += 1)
            f += n[0][t],
            e += 1;
        i[r] = Math.min(1, f / e);
        r += 1;
        s = u
    }
    recBuffers[0].push(i);
    recLength += i.length
}
function exportWAV(n) {
    for (var t = [], r, u, f, i = 0; i < numChannels; i++)
        t.push(mergeBuffers(recBuffers[i], recLength));
    r = numChannels === 2 ? interleave(t[0], t[1]) : t[0];
    u = encodeWAV(r);
    f = new Blob([u],{
        type: n
    });
    this.postMessage(f)
}
function getBuffer() {
    for (var t = [], n = 0; n < numChannels; n++)
        t.push(mergeBuffers(recBuffers[n], recLength));
    this.postMessage(t)
}
function clear() {
    recLength = 0;
    recBuffers = [];
    initBuffers()
}
function initBuffers() {
    for (var n = 0; n < numChannels; n++)
        recBuffers[n] = []
}
function mergeBuffers(n, t) {
    for (var r = new Float32Array(t), u = 0, i = 0; i < n.length; i++)
        r.set(n[i], u),
        u += n[i].length;
    return r
}
function interleave(n, t) {
    for (var f = n.length + t.length, i = new Float32Array(f), r = 0, u = 0; r < f; )
        i[r++] = n[u],
        i[r++] = t[u],
        u++;
    return i
}
function floatTo16BitPCM(n, t, i) {
    for (var u, r = 0; r < i.length; r++,
    t += 2)
        u = Math.max(-1, Math.min(1, i[r])),
        n.setInt16(t, u < 0 ? u * 32768 : u * 32767, !0)
}
function writeString(n, t, i) {
    for (var r = 0; r < i.length; r++)
        n.setUint8(t + r, i.charCodeAt(r))
}
function encodeWAV(n) {
    "use strict";
    var i = new ArrayBuffer(44 + n.length * 2)
      , t = new DataView(i);
    return writeString(t, 0, "RIFF"),
    t.setUint32(4, 36 + n.length * 2, !0),
    writeString(t, 8, "WAVE"),
    writeString(t, 12, "fmt "),
    t.setUint32(16, 16, !0),
    t.setUint16(20, 1, !0),
    t.setUint16(22, 1, !0),
    t.setUint32(24, 16e3, !0),
    t.setUint32(28, 32e3, !0),
    t.setUint16(32, 2, !0),
    t.setUint16(34, 16, !0),
    writeString(t, 36, "data"),
    t.setUint32(40, n.length * 2, !0),
    floatTo16BitPCM(t, 44, n),
    t
}