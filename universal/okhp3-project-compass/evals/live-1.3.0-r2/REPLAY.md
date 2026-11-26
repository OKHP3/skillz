# Replaying the final round

The original frozen inputs are in original-inputs, including the original pre-run manifest. The portable freeze.json redirects the two legacy relative paths to byte-identical archived inputs. The transport amendment records the single allowed null-device change. The corrected control is reused byte for byte. [Control file hashes](control-reuse.json) · [Transport amendment](TRANSPORT-ADDENDUM.md)

From the package root, verify the 23 runtime blobs in each immutable revision:

```sh
python3 -B evals/live-1.3.0/verify_revision.py evals/live-1.3.0 86a757e2c287211189e9e756f0a223b491c564e0
python3 -B evals/live-1.3.0/verify_revision.py evals/live-1.3.0-r2 19e28db9ae91491ff1e98881cbe7c570e2cb74d1
```

For a fresh public replay, use a disposable working copy of the repository with both Git objects. Save the evidence bundle separately, then copy the final-round harness files, frozen prompts, fixture data, manifests and original-inputs directory into an empty evals/live-1.3.0-r2 in that copy. Include the original matched control key and the twelve matching control evidence and grade files listed in control-reuse.json. Leave new candidate allocations, candidate submissions, supplemental results and output summaries absent. Keep the supplied candidate.json and revision.json. Preserve the parent evals.json containing the original prompts and criteria.

In that disposable directory, run the following commands. Every from_git stage extracts only SKILL.md, scripts, references and assets from the named Git object. Its inventory and hashes must match the pin before use.

```sh
python3 -B from_git.py candidate
python3 -B from_git.py grade
python3 -B from_git.py probe
python3 -B from_git.py scanner
python3 -B from_git.py discovery
python3 -B from_git.py summary
```

The executable needs the recorded Codex CLI, model access, macOS sandbox-exec, Python 3.9+ and Git. Replays consume model usage and can yield different answers. The first round uses its original revision, the same frozen inputs and corrected transport. When copying the first-round harness, also copy its entire original-inputs directory. Keep sealed trials closed; public replay excludes the custody stages. Only the custodian holds those private inputs and keys. A new protected assessment requires a newly commissioned case.
