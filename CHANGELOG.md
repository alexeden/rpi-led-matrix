[Unreleased]

### Changed

- **BREAKING**: [#46](https://github.com/alexeden/rpi-led-matrix/pull/46) The `node-addon-api` dependency has been updated to the latest version; this means that the package now _requires Node.js 18 or higher_
- [#46](https://github.com/alexeden/rpi-led-matrix/pull/46) Updates the underlying [`rpi-rgb-led-matrix`](https://github.com/hzeller/rpi-rgb-led-matrix) submodule to the latest version

# 1.12.0

### Changes

- Update dependencies flagged by npm audit
- Add the following values to the `MuxType` enum:
  - `InversedZStripe`
  - `P10Outdoor1R1G1BMultiplexMapper1`
  - `P10Outdoor1R1G1BMultiplexMapper2`
  - `P10Outdoor1R1G1BMultiplexMapper3`
  - `P10CoremanMapper`
  - `P8Outdoor1R1G1BMultiplexMapper`
  - `FlippedStripeMultiplexMapper`
  - `P10Outdoor32x16HalfScanMapper`

### Pull Requests

- [Upgrade to latest rpi-rgb-led-matrix](https://github.com/alexeden/rpi-led-matrix/pull/29)
