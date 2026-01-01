import * as net from 'net';

const socketPath = process.env.GIT_CANOPY_AUTH_SOCK;
const prompt = process.argv[2] || '';

if (!socketPath) {
  process.exit(0); // No auth socket, fail silently or let git handle it? Git will fail if we output nothing.
}

const client = net.createConnection(socketPath, () => {
  client.write(prompt);
});

client.on('data', (data) => {
  process.stdout.write(data);
  client.end();
});

client.on('end', () => {
  process.exit(0);
});

client.on('error', (_err) => {
  // console.error('Auth socket error:', _err);
  process.exit(1);
});
