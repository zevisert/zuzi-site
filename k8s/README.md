# Deployment Manifests

This application is deployed with `skaffold`.

Kubernetes dependencies are `ingress-nginx`, `cert-manager`, and `postgres-operator`.

## 1. Prod

Deployed to namespace `zuzi-site`. Hostname is `zuzanariha.art`. TLS is managed by cert-manager, using a cluster-issuer named `letsencrypt`, connected to Lets Encrypt, obviously.

## 2. Staging

Deployed to namespace `zuzi-staging`. Hostname is `demo.zuzi.art`. TLS is managed by cert-manager, which expects a cluster-issuer called `ca-issuer` - typically set up to issue self-signed certificates using a CA key pair.

## 3. Dev

Deployed to namespace `zuzi-dev`. Expects to deploy to a local `docker-desktop` kubernetes cluster. Hostname is `local.zuzi.art` (mapping to 127.0.0.1). TLS is used with a self-signed CA. Auto-activates when running `skaffold dev` and the current context name is `docker-desktop`. Postgres is port-forwarded to localhost on 5432, and a post-deploy script runs `prisma db push`.
