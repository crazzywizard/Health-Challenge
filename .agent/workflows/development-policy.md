---
description: development-policy: Ensuring code quality through testing and linting
---

As per project policy, every coding task must adhere to the following steps to ensure high reliability and maintainability:

1. **Test-Driven Development / Updates**:
   - Whenever new code is written or existing code is significantly modified, corresponding unit tests must be created or updated.
   - Use `bun test` to ensure new tests pass and no regressions are introduced.

2. **Continuous Linting**:
   - Ensure all new code is lint-free using `bun run lint`.
   - Any linting warnings or errors introduced by changes must be resolved before finalizing the task.

3. **Post-Task Verification**:
   - Once all sub-tasks in an objective are complete, perform a final run of both `bun test` and `bun run lint`.
   - All tests must pass, and the linting output must be 100% clean (0 errors, 0 warnings).

4. **Documentation**:
   - Update the `walkthrough.md` with verification results, including test output and linting confirmation.
