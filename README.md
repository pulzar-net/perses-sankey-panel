# Sankey panel for Perses

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/pulzar-net/perses-sankey-panel/releases/latest/download/preview-dark.png">
  <img alt="The PulzrSankeyPanel: revenue from parking, permits and events flowing into gross and out to refunds, fees, tax and net" src="https://github.com/pulzar-net/perses-sankey-panel/releases/latest/download/preview-light.png">
</picture>

`PulzrSankeyPanel` draws where amounts came from and where they went: revenue by source flowing into gross, then out to refunds, processor fees, tax and net. Each node is labelled outside with its name and a short value, `Parking $8.3k`.

```yaml
kind: Panel
spec:
  plugin:
    kind: PulzrSankeyPanel
    spec:
      links:
        - { from: Parking, to: Gross, series: Parking }
        - { from: Permits, to: Gross, series: Permits }
        - { from: Gross, to: Refunds, series: Refunds }
        - { from: Gross, to: Processor fees, series: Processor fees }
        - { from: Gross, to: Tax, series: Tax }
        - { from: Gross, to: Net, series: Net }
      format: { unit: usd, decimalPlaces: 2 }
      colors: { Parking: '#2563eb', Permits: '#7c3aed', Gross: '#64748b', Net: '#10b981' }
```

- `links` (at least one): each flows from the node `from` to the node `to`, as much as the last value of the series named `series` (its formatted name). Nodes are named by `from` and `to` as written, in the order they first appear. Series labelled `compare` (the period before) are left out.
- A link whose series has no value, or zero or less, is left out, and so is a node left with no links.
- `format` formats the values in labels and tooltips (any Perses format). Labels shorten currency and decimals, `$840`, `$8.3k`, `$12k`; tooltips give the value in full.
- `colors`: a color per node name, any CSS color. A node without one takes the theme's next series color.
- Links shade from their source's color to their target's. Nodes with links both in and out (Gross) go unlabelled, since they sit on their own links. The space beside the nodes is as wide as the longest label, 170px at most.
- "No data" shows when no link has a value.

## Install

Put the archive (`PulzrSankeyPanel-<version>.tar.gz`, from the releases) in a folder listed in the Perses server's `plugin.archive_paths`, or `npm install @pulzr/perses-sankey-panel` to embed it.

## Development

```bash
npm install
npm test
percli plugin test-schemas
npm run build
percli plugin build
```

### Releasing

Set the new version in `package.json`, commit, then tag and push it:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The Release workflow tests and builds, publishes the package to npm with provenance, and attaches the Perses plugin archive and the npm tarball to a GitHub release.

## License

Apache 2.0.
