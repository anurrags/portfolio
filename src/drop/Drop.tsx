import { useCallback, useEffect, useRef, useState } from 'react'

import { DropContent } from './components/DropContent'
import { Icon } from '../shared/Icon'
import { QrCode } from './components/QrCode'
import type { DropMode } from './network/signal'
import {
  checkPairingCode,
  createPairingCode,
  fetchDropSession,
  formatBytes,
  formatRate,
  readCodeFromUrl,
  writeCodeToUrl,
  type DropSession,
} from './network/signal'
import { useDropNetwork, type DropPeer } from './network/useDropNetwork'
import site from './content.json'
import { loadUser } from '../shared/user'

type Gate =
  | { status: 'checking' }
  | { status: 'error' }
  | { status: 'cellular' }
  | { status: 'open'; session: DropSession }

/** The pairing code, and how we got it. */
type Pairing =
  | { status: 'idle' }
  | { status: 'working' }
  | { status: 'paired'; code: string }
  | { status: 'bad-code'; code: string }
  | { status: 'failed'; message: string }

const LINK_LABEL: Record<string, string> = {
  connecting: 'connecting…',
  ready: 'ready',
  failed: 'no direct route',
  closed: 'disconnected',
}

export function Drop() {
  const [gate, setGate] = useState<Gate>({ status: 'checking' })
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [pairing, setPairing] = useState<Pairing>({ status: 'idle' })
  const [showPairingPanel, setShowPairingPanel] = useState(false)
  const [typedCode, setTypedCode] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const me = useRef(loadUser()).current

  useEffect(() => {
    let cancelled = false
    fetchDropSession()
      .then((session) => {
        if (cancelled) return
        if (!session) {
          setGate({ status: 'error' })
        } else if (!('ok' in session)) {
          setGate({ status: 'cellular' })
        } else {
          setGate({ status: 'open', session })
        }
      })
      .catch(() => {
        if (!cancelled) setGate({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  // A code in the fragment means we were opened from a QR or a shared link:
  // validate and join it, no typing involved.
  useEffect(() => {
    if (gate.status !== 'open') return
    const fromUrl = readCodeFromUrl()
    if (!fromUrl) return

    let cancelled = false
    setPairing({ status: 'working' })
    checkPairingCode(fromUrl)
      .then((exists) => {
        if (cancelled) return
        setPairing(exists ? { status: 'paired', code: fromUrl } : { status: 'bad-code', code: fromUrl })
      })
      .catch(() => {
        if (!cancelled) setPairing({ status: 'bad-code', code: fromUrl })
      })
    return () => {
      cancelled = true
    }
  }, [gate.status])

  const iceServers = gate.status === 'open' ? gate.session.iceServers : []
  const activeCode = pairing.status === 'paired' ? pairing.code : null
  const net = useDropNetwork(activeCode, me.name, gate.status === 'open', iceServers)

  const mintCode = async () => {
    setPairing({ status: 'working' })
    try {
      const { code } = await createPairingCode()
      writeCodeToUrl(code)
      setPairing({ status: 'paired', code })
    } catch (cause) {
      setPairing({
        status: 'failed',
        message: cause instanceof Error ? cause.message : 'Could not create a code',
      })
    }
  }

  const joinCode = async (raw: string) => {
    const code = raw.replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) return
    setPairing({ status: 'working' })
    const exists = await checkPairingCode(code).catch(() => false)
    if (exists) {
      writeCodeToUrl(code)
      setPairing({ status: 'paired', code })
    } else {
      setPairing({ status: 'bad-code', code })
    }
  }

  const readyPeers = net.peers.filter((peer) => peer.state === 'ready')

  /**
   * Default only to an *unambiguous* destination.
   *
   * This used to fall back to `readyPeers[0]` whenever nothing was selected,
   * which silently sent files to whichever peer happened to be first — a stray
   * tab on this same machine, for instance, instead of the phone. Now the only
   * automatic pick is a single ready peer on a different LAN address; anything
   * more ambiguous has to be chosen by hand.
   */
  const remotePeers = readyPeers.filter((peer) => peer.deviceId !== net.myDeviceId)
  const autoTarget = remotePeers.length === 1 ? remotePeers[0]!.id : undefined
  const target =
    selected && readyPeers.some((peer) => peer.id === selected) ? selected : autoTarget
  const targetPeer = net.peers.find((peer) => peer.id === target)
  // Any ready peer we haven't auto-targeted needs a deliberate click — saying
  // "waiting for a connection" there would be wrong, the link is up.
  const mustChoose = !target && readyPeers.length > 0
  const onlySameMachine =
    mustChoose && readyPeers.every((peer) => peer.deviceId === net.myDeviceId)

  const send = useCallback(
    (files: FileList | File[]) => {
      const list = [...files]
      if (list.length === 0 || !target) return
      net.sendFiles(target, list)
    },
    [net, target],
  )

  if (gate.status === 'checking') return <div className="centered muted">…</div>

  if (gate.status === 'cellular') {
    return (
      <div className="centered">
        <div className="card">
          <h1>Join a WiFi network</h1>
          <p className="muted">
            This looks like a mobile connection. Transfers here happen directly between devices on
            the same WiFi, so mobile data can't take part.
          </p>
          <p className="note">
            Connect this device to the same WiFi as the one you're sending to, then reload.
          </p>
        </div>
      </div>
    )
  }

  if (gate.status === 'error') {
    return (
      <div className="centered">
        <div className="card">
          <h1>Can’t reach the server</h1>
          <p className="muted">The signalling server isn’t responding.</p>
        </div>
      </div>
    )
  }

  const { session } = gate

  if (pairing.status !== 'paired') {
    return (
      <div className="drop">
        <PairingScreen
          pairing={pairing}
          typedCode={typedCode}
          onTypedCodeChange={setTypedCode}
          onCreate={mintCode}
          onJoin={joinCode}
        />
        {/* The landing state is what a first-time visitor — and a crawler —
            actually sees, so the description belongs here above all. */}
        <DropContent />
      </div>
    )
  }

  const code = pairing.code
  /**
   * The QR must point somewhere the *other* device can reach.
   *
   * A LAN address the backend reported wins whenever there is one — reading
   * `window.location.origin` would hand out `localhost`, which a phone cannot
   * resolve. The address comes back bare, and is combined with *this page's*
   * port: the backend runs on its own port, so a URL built from its port would
   * send the phone to the API instead of the page.
   *
   * Deployed, the backend is on Render and reports no LAN address, so the
   * page's own origin — the portfolio's public URL — is the right answer.
   */
  const pageUrlOn = (host: string) =>
    `${window.location.protocol}//${host}${window.location.port ? `:${window.location.port}` : ''}`
  const lanHost = session.lanAddresses[0]
  const base = lanHost ? pageUrlOn(lanHost) : window.location.origin
  // The fragment carries the code, so a scanned QR pairs without anyone typing.
  const shareUrl = `${base}/drop#${code}`

  // True when this page itself is on an address the other device can't use.
  const onUnreachableOrigin =
    session.lanAddresses.length > 0 && !session.lanAddresses.includes(window.location.hostname)
  const selfUrl = `${base}/drop${window.location.hash}`
  const canSend = Boolean(target)
  const stuck = net.peers.length > 0 && readyPeers.length === 0

  // The QR and code exist to get a second device here. Once one has arrived
  // they are just noise occupying half the width, so they fold away — but stay
  // reachable, since a third device may still need to join.
  const waitingForFirstDevice = net.peers.length === 0
  const pairingPanelVisible = waitingForFirstDevice || showPairingPanel

  const copyShareUrl = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="drop">
      <header className="appbar">
        <div className="appbar-left">
          <span className="brandmark">
            <Icon name="wifi" size={17} />
            drop
          </span>
          <span className="muted drop-sub drop-tagline">
            same WiFi · device to device · no server copy
          </span>
        </div>
        <div className="appbar-right">
          {session.mode === 'internet' && session.room && (
            <span className="badge badge-room" title="Devices behind your router share this group">
              network {session.room}
            </span>
          )}
          <span className={`status ${net.signalConnected ? 'status-ready' : 'status-offline'}`}>
            <i className="dot" />
            {net.signalConnected ? `${net.peers.length + 1} here` : 'offline'}
          </span>
        </div>
      </header>

      <main
        className={[
          'drop-body',
          pairingPanelVisible ? '' : 'drop-body-wide',
          waitingForFirstDevice ? 'drop-body-waiting' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <section className="drop-pane">
          {net.peers.length === 0 ? (
            <div className="dropzone dropzone-idle">
              <div className="dropzone-icon">
                <Icon name="clock" size={22} />
              </div>
              <p className="dropzone-title">Waiting for your other device</p>
              <p className="note">
                Scan the QR code with your other device, or enter the pairing code there. Once it
                appears, files go straight between the two — they never reach the server.
              </p>
            </div>
          ) : (
            <>
              <div className="peer-strip">
                {net.peers.map((peer) => (
                  <button
                    key={peer.id}
                    className={peer.id === target ? 'peer-chip peer-chip-active' : 'peer-chip'}
                    disabled={peer.state !== 'ready'}
                    onClick={() => setSelected(peer.id)}
                  >
                    <span className={`dot dot-${peer.state}`} />
                    <span className="peer-chip-text">
                      <span className="peer-name">
                        {peer.name}
                        {peer.kind ? ` · ${peer.kind}` : ''}
                      </span>
                      <span className="muted peer-state">
                        {peer.deviceId === net.myDeviceId ? 'this browser · ' : ''}
                        {LINK_LABEL[peer.state]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div
                className={
                  dragging && canSend
                    ? 'dropzone dropzone-active'
                    : canSend
                      ? 'dropzone'
                      : 'dropzone dropzone-idle'
                }
                onClick={() => canSend && inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragging(false)
                  send(event.dataTransfer.files)
                }}
              >
                <div className="dropzone-icon">
                  <Icon name="upload" size={22} />
                </div>
                <p className="dropzone-title">
                  {canSend
                    ? 'Choose files or drag them here'
                    : mustChoose
                      ? 'Pick a device above first'
                      : 'Waiting for a direct connection…'}
                </p>
                <p className="note">
                  {canSend && targetPeer ? (
                    <>
                      Sending to <strong>{targetPeer.name}</strong>
                      {targetPeer.kind ? ` · ${targetPeer.kind}` : ''}
                    </>
                  ) : onlySameMachine ? (
                    'The only device connected is another tab of this browser. Click it above if you meant that, or open this page on your other device.'
                  ) : mustChoose ? (
                    'More than one device is connected, so there is no safe default — click the one you mean.'
                  ) : (
                    'Both devices are on the page, but no peer-to-peer route has come up yet.'
                  )}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files) send(event.target.files)
                    event.target.value = ''
                  }}
                />
              </div>
            </>
          )}

          {/* Covers localhost and the Vite dev port, where the server sees a
              loopback address: it cannot repair this device's ICE candidates,
              and the page's own origin is not shareable. */}
          {onUnreachableOrigin && (
            <div className="callout" role="alert">
              <p className="callout-head">
                <Icon name="alert" size={15} />
                This page is open on an address your other device can’t reach
              </p>
              <p className="note">
                You’re on <code>{window.location.host}</code>. The server sees you as{' '}
                <code>{session.yourRawIp ?? 'a loopback address'}</code>, so it can’t repair this
                device’s connection candidates — a direct transfer probably won’t form even once
                the other device pairs. The QR to the right already points at the right address.
              </p>
              <a className="control control-primary control-sm" href={selfUrl}>
                <Icon name="link" size={15} />
                Reopen on {new URL(base).host}
              </a>
            </div>
          )}

          {stuck && <Troubleshooting peers={net.peers} mode={session.mode} />}

          {net.transfers.length > 0 && (
            <>
              <h2 className="drop-heading">Transfers</h2>
              <ul className="file-list">
                {net.transfers.map((transfer) => (
                  <li key={transfer.id} className="file-row">
                    <span
                      className={
                        transfer.direction === 'send' ? 'file-dir' : 'file-dir file-dir-in'
                      }
                    >
                      <Icon
                        name={transfer.direction === 'send' ? 'upload' : 'download'}
                        size={16}
                        label={transfer.direction === 'send' ? 'Sending' : 'Receiving'}
                      />
                    </span>
                    <div className="file-main">
                      <span className="file-name">{transfer.name}</span>
                      <span className="muted file-meta">
                        {transfer.status === 'failed' ? (
                          <span className="error">{transfer.error ?? 'Failed'}</span>
                        ) : transfer.status === 'cancelled' ? (
                          'Cancelled'
                        ) : transfer.status === 'done' ? (
                          `${formatBytes(transfer.size)} · ${
                            transfer.direction === 'send' ? 'sent to' : 'from'
                          } ${transfer.peerName}`
                        ) : (
                          `${formatBytes(transfer.transferred)} of ${formatBytes(transfer.size)}` +
                          (transfer.bytesPerSecond > 0
                            ? ` · ${formatRate(transfer.bytesPerSecond)}`
                            : '')
                        )}
                      </span>
                      {transfer.status === 'active' && (
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${
                                transfer.size > 0
                                  ? Math.min(100, (transfer.transferred / transfer.size) * 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {transfer.status === 'done' && transfer.url && (
                      <a
                        className="control control-primary control-sm"
                        href={transfer.url}
                        download={transfer.name}
                      >
                        <Icon name="download" size={15} />
                        Save
                      </a>
                    )}
                    {transfer.status === 'active' && transfer.direction === 'send' && target && (
                      <button
                        className="control control-sm"
                        onClick={() => net.cancel(target, transfer.id)}
                      >
                        Cancel
                      </button>
                    )}
                    {transfer.status !== 'active' && (
                      <button
                        className="control control-quiet control-icon"
                        title="Dismiss"
                        onClick={() => net.dismiss(transfer.id)}
                      >
                        <Icon name="close" size={16} label="Dismiss" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="row row-wrap footer-actions">
            {!pairingPanelVisible && (
              <button className="link-button" onClick={() => setShowPairingPanel(true)}>
                Add another device
              </button>
            )}
            <button className="link-button" onClick={() => setShowDetails((v) => !v)}>
              {showDetails ? 'Hide' : 'Show'} connection details
            </button>
          </div>
          {showDetails && <Details session={session} myIp={net.myIp} peers={net.peers} />}
        </section>

        {pairingPanelVisible && (
        <aside className="drop-pane drop-aside">
          <div className="card-head">
            <h2 className="drop-heading">
              {waitingForFirstDevice ? 'Pair your other device' : 'Add another device'}
            </h2>
            {!waitingForFirstDevice && (
              <button
                className="control control-quiet control-icon"
                title="Hide"
                onClick={() => setShowPairingPanel(false)}
              >
                <Icon name="close" size={16} label="Hide" />
              </button>
            )}
          </div>
          {shareUrl ? (
            <>
              <QrCode value={shareUrl} />
              {/* The code sits directly under the QR: it is the fallback for
                  when scanning isn't possible, so it belongs beside it. */}
              <div className="code-display" aria-label={`Pairing code ${code.split('').join(' ')}`}>
                {code.slice(0, 3)} <span>{code.slice(3)}</span>
              </div>
              <code className="drop-url">{shareUrl}</code>
              <button className="control control-block" onClick={copyShareUrl}>
                <Icon name={copied ? 'check' : 'copy'} size={15} />
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <p className="note">
                Scanning the code pairs immediately — it carries the pairing code. Otherwise open
                the address above on the other device and type the six digits. Both devices must be
                on the same WiFi.
              </p>
              {session.mode === 'lan' && session.lanAddresses.length > 1 && (
                <p className="note">
                  This machine has more than one network address. If the first doesn't load, try:{' '}
                  {session.lanAddresses.slice(1).map((host) => (
                    <code key={host} className="drop-url-alt">
                      {pageUrlOn(host)}/drop#{code}
                    </code>
                  ))}
                </p>
              )}
            </>
          ) : (
            <p className="note">
              No private network address was found on this machine, so other devices can't reach
              it. Connect this machine to WiFi and reload.
            </p>
          )}
        </aside>
        )}
      </main>

      <DropContent />
    </div>
  )
}

/** Shown when both devices are present but ICE never completes. */
function Troubleshooting({ peers, mode }: { peers: DropPeer[]; mode: DropMode }) {
  const anyMdns = peers.some((peer) => peer.diagnostics?.remoteHasMdns)

  return (
    <div className="callout">
      <p className="callout-head">
        <Icon name="alert" size={15} />
        No direct route yet
      </p>
      <ul className="callout-list">
        {anyMdns && mode !== 'internet' && (
          <li>
            The other device's candidates still contain a <code>.local</code> name, which means the
            server couldn't map it to a LAN address. Make sure that device also opened this page via
            the <code>192.168.x.x</code> address.
          </li>
        )}
        {anyMdns && mode === 'internet' && (
          <li>
            Both devices are advertising <code>.local</code> addresses, which they must resolve
            between themselves over multicast DNS. Some networks block that — on this hosted setup
            there is no way around it.
          </li>
        )}
        <li>
          Both devices must be on the <strong>same WiFi network and band-group</strong> — a “guest”
          network is usually isolated from the main one.
        </li>
        <li>
          Your router may have <strong>AP / client isolation</strong> enabled, which blocks
          device-to-device traffic outright. There is no relay fallback, so this cannot be worked
          around here.
        </li>
        <li>
          <strong>Check both devices are on WiFi, not mobile data.</strong> There is no STUN or
          relay here, so a device on cellular has no address the other can reach — which is what
          keeps transfers on your own network.
        </li>
        <li>Turn off any VPN on either device — it pulls traffic off the LAN.</li>
      </ul>
    </div>
  )
}

function Details({
  session,
  myIp,
  peers,
}: {
  session: DropSession
  myIp: string | null
  peers: DropPeer[]
}) {
  return (
    <div className="details">
      <div className="details-row">
        <span className="muted">mode</span>
        <code>{session.mode === 'internet' ? 'hosted' : 'local network'}</code>
      </div>
      {session.mode === 'lan' && (
        <div className="details-row">
          <span className="muted">this device, as the server sees it</span>
          <code>{myIp ?? `${session.yourRawIp ?? 'unknown'} (not private)`}</code>
        </div>
      )}
      <div className="details-row">
        <span className="muted">ice servers</span>
        <code>
          {session.iceServers.length > 0
            ? session.iceServers.map((entry) => entry.urls).join(', ')
            : 'none — WiFi-only by design'}
        </code>
      </div>
      {peers.length === 0 && <p className="note">No other device connected.</p>}
      {peers.map((peer) => (
        <div key={peer.id} className="details-block">
          <div className="details-row">
            <span className="muted">{peer.name}</span>
            <code>{peer.state}</code>
          </div>
          {peer.diagnostics ? (
            <>
              <div className="details-row">
                <span className="muted">ice / conn</span>
                <code>
                  {peer.diagnostics.iceConnectionState} / {peer.diagnostics.connectionState}
                </code>
              </div>
              <div className="details-row">
                <span className="muted">selected pair</span>
                <code>{peer.diagnostics.selectedPair ?? 'none'}</code>
              </div>
              <div className="details-row">
                <span className="muted">my candidates</span>
                <code>{peer.diagnostics.localCandidates.join(', ') || 'none yet'}</code>
              </div>
              <div className="details-row">
                <span className="muted">their candidates</span>
                <code>
                  {peer.diagnostics.remoteCandidates.join(', ') || 'none yet'}
                  {peer.diagnostics.remoteHasMdns ? '  ← unresolved .local' : ''}
                </code>
              </div>
            </>
          ) : (
            <p className="note">Gathering…</p>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Shown until a pairing code is active.
 *
 * One device mints a code, the other enters it — or, far more likely, scans the
 * QR on the paired screen, whose URL carries the code in its fragment.
 */
function PairingScreen({
  pairing,
  typedCode,
  onTypedCodeChange,
  onCreate,
  onJoin,
}: {
  pairing: { status: string; code?: string; message?: string }
  typedCode: string
  onTypedCodeChange: (value: string) => void
  onCreate: () => void
  onJoin: (code: string) => void
}) {
  const busy = pairing.status === 'working'

  return (
    <div className="drop-hero">
      <div className="card">
        <div className="card-title">
          <h1 className="drop-h1">
            <Icon name="wifi" size={20} /> Share files over WiFi
          </h1>
          <p className="drop-lede">{site.tagline}</p>
        </div>

        {pairing.status === 'bad-code' && (
          <p className="error" role="alert">
            <Icon name="alert" size={14} />
            <span>
              Code {pairing.code} isn’t active. Codes expire after 30 minutes of no use.
            </span>
          </p>
        )}
        {pairing.status === 'failed' && (
          <p className="error" role="alert">
            <Icon name="alert" size={14} />
            <span>{pairing.message}</span>
          </p>
        )}

        <button
          className="control control-primary control-block"
          onClick={onCreate}
          disabled={busy}
        >
          <Icon name="plus" size={16} />
          {busy ? 'Working…' : 'Create a pairing code'}
        </button>

        <hr className="rule" />

        <form
          className="field"
          onSubmit={(event) => {
            event.preventDefault()
            onJoin(typedCode)
          }}
        >
          <label className="field-label" htmlFor="code">
            Or enter the code from your other device
          </label>
          <div className="row">
          <input
            id="code"
            className="control control-grow code-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={7}
            value={typedCode}
            onChange={(event) => onTypedCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
            <button
              className="control"
              type="submit"
              disabled={busy || typedCode.replace(/\D/g, '').length !== 6}
            >
              Pair
            </button>
          </div>
        </form>

        <p className="note">
          Both devices must be on the same WiFi. Mobile data can’t take part — there is no relay,
          so a cellular device has no address the other can reach.
        </p>
      </div>
    </div>
  )
}
