"""Exercise /qr in the real launcher with an isolated native-protocol fixture."""
import fcntl
import os
import pathlib
import pty
import selectors
import signal
import struct
import subprocess
import sys
import termios
import time

folders = pathlib.Path(sys.argv[1])
sys.path.insert(0, str(folders / 'test'))
from terminal_screen import screen

master, slave = pty.openpty()
fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 35, 100, 0, 0))
env = {**os.environ, 'TERM': 'xterm-256color',
       'CODEX_FOLDERS_CODEX_BIN': str(folders / 'test/fixtures/codex'),
       'CODEX_FOLDERS_TEST_TERMINAL': '1'}
env.pop('CODEX_FOLDERS_WRAPPED', None)
process = subprocess.Popen(['node', str(folders / 'dist/cli.js'), 'launch', '--',
                            '-m', 'fixture-model', '--sandbox', 'read-only'],
                           stdin=slave, stdout=slave, stderr=slave, env=env,
                           start_new_session=True)
os.close(slave)
selector = selectors.DefaultSelector()
selector.register(master, selectors.EVENT_READ)
recording = bytearray()

def collect_until(predicate, timeout=12):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        for _, _ in selector.select(.1):
            try:
                data = os.read(master, 65536)
            except OSError:
                data = b''
            if not data:
                raise AssertionError('Launcher exited unexpectedly')
            recording.extend(data)
        if predicate():
            return
    raise AssertionError('Timed out waiting for terminal state: ' + screen(recording, 100, 35)[-1800:])

def visible(text, rows=35):
    return text in screen(recording, 100, rows)

def send(text):
    os.write(master, text.encode())

try:
    collect_until(lambda: visible('FIXTURE_ORIGINAL'))
    send('/q')
    collect_until(lambda: visible('/qr    pair ChatGPT mobile'))
    send('\t')
    collect_until(lambda: visible('› /qr'))
    send('\r')
    collect_until(lambda: visible('ChatGPT remote pairing') and visible('Enter: back | D: link/code'))
    frame = screen(recording, 100, 35)
    assert any(char in frame for char in '▀▄█'), 'QR modules must be visible'
    assert 'Unknown command' not in frame, 'Codex model/sandbox flags must not reach codex-remote'
    fcntl.ioctl(master, termios.TIOCSWINSZ, struct.pack('HHHH', 12, 100, 0, 0))
    process.send_signal(signal.SIGWINCH)
    collect_until(lambda: visible('Enlarge the terminal', 12))
    send('d')
    collect_until(lambda: visible('Manual code: 1234-5678', 12))
    fcntl.ioctl(master, termios.TIOCSWINSZ, struct.pack('HHHH', 35, 100, 0, 0))
    process.send_signal(signal.SIGWINCH)
    send('d')
    collect_until(lambda: visible('ChatGPT remote pairing') and visible('Enter: back | D: link/code'))
    send('\r')
    collect_until(lambda: visible('FIXTURE_ORIGINAL') and not visible('phone pairing'))
    frame = screen(recording, 100, 35)
    assert 'SUBMITTED:/qr' not in frame
    assert '› /qr' not in frame, 'QR command must be cleared from original composer'
    send('still here')
    collect_until(lambda: visible('› still here'))
    send('\x03')
    process.wait(timeout=5)
    assert process.returncode == 0
    print('QR launcher: retained chat, clean flags, resize fallback, details, and return passed')
finally:
    if process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
    selector.close()
    os.close(master)
