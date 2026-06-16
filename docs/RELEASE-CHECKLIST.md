# Release Checklist

Use this checklist before publishing any npm or NuGet release.

## 1. Decide SemVer

- Patch: documentation, metadata, format-only additions, bug fixes that align
  behavior with documented semantics.
- Minor: new checksum-backed jurisdictions, new optional APIs, new identifier
  families that do not break existing callers.
- Major: breaking public API, result model or policy semantics.

## 2. Update versions

Update all published packages:

- `projects/tax-id/package.json`
- `packages/dotnet/NationalIdentifiers.Core/NationalIdentifiers.Core.csproj`
- `packages/dotnet/NationalIdentifiers.AspNetCore/NationalIdentifiers.AspNetCore.csproj`

Update `CHANGELOG.md` with the exact release date.

## 3. Documentation consistency

Check that these documents agree on package names, counts, limitations and API
style:

- `README.md`
- `projects/tax-id/README.md`
- `packages/dotnet/NationalIdentifiers.Core/README.md`
- `packages/dotnet/NationalIdentifiers.AspNetCore/README.md`
- `docs/COVERAGE-DEPTH.md`
- `docs/KNOWN-LIMITATIONS.md`
- `docs/RULE-SOURCE-POLICY.md`

Current canonical counts:

- 195 personal state identifiers
- 7 territories
- 38 VAT jurisdictions
- 12 company-tax jurisdictions
- 47 identity-consistency jurisdictions
- 252 source catalogue records

## 4. Local gate

Run:

```bash
npm run sources:check
npm test
npm run test:angular -- --browsers=ChromeHeadless
npm run build:demo
dotnet test packages/dotnet/NationalIdentifiers.Tests/NationalIdentifiers.Tests.csproj --configuration Release
npm pack --dry-run ./dist/tax-id
dotnet pack packages/dotnet/NationalIdentifiers.Core/NationalIdentifiers.Core.csproj --configuration Release --output artifacts
dotnet pack packages/dotnet/NationalIdentifiers.AspNetCore/NationalIdentifiers.AspNetCore.csproj --configuration Release --output artifacts
```

## 5. Inspect package metadata

Confirm:

- npm package name is `national-identifiers`;
- npm version matches the release;
- npm exports include `.` and `./angular`;
- npm trusted publishing is configured for the GitHub repository and
  `.github/workflows/release.yml`; the workflow publishes with provenance and
  does not require an `NPM_TOKEN` secret;
- NuGet package IDs are unchanged;
- `NationalIdentifiers.AspNetCore` depends on the same `NationalIdentifiers.Core`
  version;
- NuGet README files are packed.

## 6. Commit, tag and push

```bash
git status --short
git diff --check
git add -A
git commit -m "release: national identifiers x.y.z"
git tag -a vx.y.z -m "vx.y.z"
git push origin main
git push origin vx.y.z
```

Use a documentation-specific commit message for doc-only patch releases.

## 7. Verify registries

After publishing, verify:

```bash
npm view national-identifiers version
curl -s https://api.nuget.org/v3-flatcontainer/nationalidentifiers.core/index.json
curl -s https://api.nuget.org/v3-flatcontainer/nationalidentifiers.aspnetcore/index.json
```

## 8. Registry publication

NuGet trusted publishing is configured and should publish from GitHub Actions.

npm publishing is expected to use trusted publishing/OIDC from GitHub Actions.
Do not consider the release complete until npm `latest` and both NuGet package
indexes expose the intended version.
