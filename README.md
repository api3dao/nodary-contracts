# @nodary/contracts

> Contracts through which Nodary services are delivered

## Deployment

To deploy the contracts on a new chain

1. Enter the manager multisig address into [`deployments/manager-multisig.json`](deployments/manager-multisig.json)
1. Update the `networks` variable in the deployment scripts in `deploy/` (TODO: extract this into a file)
1. Run `NETWORK=... yarn deploy` to deploy the contracts non-deterministically (mostly because `@api3/airnode-protocol-v1` has already deployed OwnableCallForwarder deterministically so there is a collision)
