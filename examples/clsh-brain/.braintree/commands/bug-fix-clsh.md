Debug and fix a bug in clsh.dev: $ARGUMENTS

1. Read the description of the bug: "$ARGUMENTS"
2. Identify which package is affected (agent, web, cli, landing)
3. Read the relevant source files and vault documentation
4. Reproduce the issue if possible
5. Identify root cause:
   - **Bug location**: File and line number
   - **Root cause**: Why it happens
   - **Impact**: What's broken for users
6. Implement the fix:
   - Make the minimal change needed
   - Ensure no regressions
   - Add a test if the area lacks coverage
7. Update vault files if the bug reveals a documentation gap
8. Output a summary:
   - **Bug**: What was broken
   - **Cause**: Why it happened
   - **Fix**: What was changed
   - **Files modified**: List of touched files
   - **Test**: How to verify the fix
