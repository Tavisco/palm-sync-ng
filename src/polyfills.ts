import { Buffer } from 'buffer';
import * as process from 'process';

window.Buffer = Buffer;
window.process = process;

// stream: "stream-browserify",
// _stream_duplex: "readable-stream/duplex",
// _stream_passthrough: "readable-stream/passthrough",
// _stream_readable: "readable-stream/readable",
// _stream_transform: "readable-stream/transform",
// _stream_writable: "readable-stream/writable",