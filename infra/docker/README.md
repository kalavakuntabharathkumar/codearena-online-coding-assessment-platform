# Production sandbox notes

The demo worker intentionally does not execute candidate code. A production runner should be a separate service with:
- one disposable sandbox per execution;
- pinned, minimal language images and no privileged mode;
- non-root user, read-only root filesystem, dropped Linux capabilities;
- network disabled by default, seccomp/AppArmor, cgroups;
- strict CPU, memory, process, wall-clock and output limits;
- queue-level retries, idempotency, metrics and dead-letter handling.
