# Code Review Comments (Strict / Critical)

1. **[High] Backward compatibility regression: agent counts now ignore existing `.claude/agents` brains.**  
   **Where:** `packages/web/src/app/api/brains/route.ts:20`, `packages/web/src/app/api/brains/route.ts:34`  
   **Comment:** You hard-switched to `.braintree/agents/` and dropped `.claude/agents/` support with zero migration strategy. Existing users suddenly show `0` agents even though their brains are valid.  
   **Missing edge case:** Brains created before this change (or imported legacy brains) silently degrade in UI metrics.

2. **[High] Same regression duplicated in SSR page logic, guaranteeing inconsistent behavior across surfaces.**  
   **Where:** `packages/web/src/app/brains/page.tsx:32`, `packages/web/src/app/brains/page.tsx:47`  
   **Comment:** Same path hard-switch repeated in a second code path instead of centralized logic. This doubles maintenance risk and guarantees drift later.  
   **Missing edge case:** One side gets patched for legacy support, the other is forgotten; API and page disagree on agent counts.

3. **[High] Command install flow can partially fail but still claims success.**  
   **Where:** `packages/cli/src/index.ts:31`, `packages/cli/src/index.ts:33`, `packages/cli/src/index.ts:36`, `packages/cli/src/index.ts:38`  
   **Comment:** You copy each file to two destinations without transactional handling. If copying to one directory fails (permissions, locked file, readonly home), the function still returns `files.length` and lies to the user.  
   **Missing edge case:** `.braintree-os/commands` succeeds but `.claude/commands` fails; user sees success banner and hits missing commands later.

4. **[High] “Universal agent support” messaging is misleading because instructions still default to slash-command UX.**  
   **Where:** `packages/cli/src/index.ts:101`, `packages/cli/src/index.ts:102`, `README.md:58`, `README.md:61`  
   **Comment:** You tell users this works for many agents, then immediately instruct `/init-braintree` as the primary path. Most non-Claude agents do not support slash commands. This is confusing product behavior disguised as onboarding.  
   **Missing edge case:** New users on non-slash agents follow docs exactly and fail on first command.

5. **[Medium] The CLI version shown to users is stale and wrong.**  
   **Where:** `packages/cli/src/index.ts:14`  
   **Comment:** Version is hardcoded to `0.1.0` while package metadata is `0.2.4`. This breaks trust in diagnostics and support reports.  
   **Missing edge case:** Bug reports include wrong version string, wasting triage time.

6. **[Medium] Example vault docs are internally contradictory after the rename.**  
   **Where:** `examples/clsh-brain/README.md:13`, `examples/clsh-brain/README.md:23`, `examples/clsh-brain/README.md:57`, `examples/clsh-brain/README.md:123`  
   **Comment:** This file now references both `.claude/` and `.braintree/agents/` as if both are canonical. It reads like a half-migration and makes the example untrustworthy.  
   **Missing edge case:** Users scaffold from example docs and create mixed directory layouts that tools do not handle consistently.

7. **[Medium] Example command doc points to `.braintree/agents`, but the example repository still stores agent files under `.claude/agents`.**  
   **Where:** `examples/clsh-brain/.claude/commands/plan-clsh.md:17`  
   **Comment:** The command now instructs reading persona files from a path that doesn’t exist in this example structure. That is a direct broken reference in your own sample.  
   **Missing edge case:** Automation reading this command fails to locate assigned agent persona context.

8. **[Medium] “Concurrency & Orchestration” section is hand-wavy and does not actually prevent lost updates.**  
   **Where:** `packages/cli/commands/init-braintree.md:344`, `packages/cli/commands/init-braintree.md:346`, `packages/cli/commands/init-braintree.md:347`  
   **Comment:** “Read before write” is not concurrency control. Two agents can read the same version, both merge “carefully,” and still clobber each other. If you’re introducing multi-agent edits, specify a concrete conflict strategy (version check, lock file, append-only logs, or rebase loop).  
   **Missing edge case:** Simultaneous updates to `Execution-Plan.md` and `BRAIN-INDEX.md` create silent data loss.

9. **[Low] Example historical note now references an implausible path (`~/.claude/BRAIN.md`).**  
   **Where:** `examples/clsh-brain/Execution-Plan.md:655`  
   **Comment:** This looks like a blind find/replace artifact. `BRAIN.md` is a project root file, not a home-level dotfolder file under `.claude`.  
   **Missing edge case:** People copying that operational note will configure the wrong path and fail to enforce the intended writing rule.

10. **[Low] Migration scope is incomplete: rename happened in docs, but compatibility rules are not codified anywhere central.**  
    **Where:** `README.md:44`, `README.md:410`, `packages/web/src/lib/local-data.ts:145`  
    **Comment:** The narrative says universal and implies transition, but there is no explicit support matrix or deprecation policy for `.claude/*` vs `.braintree/*`. This is exactly how ecosystems split into inconsistent project states.  
    **Missing edge case:** Teams with mixed old/new brains see non-deterministic behavior between tooling, examples, and UI counters.
