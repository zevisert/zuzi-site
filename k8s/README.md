# Deployment Manifests

This application is deployed with `skaffold`.

Each environment expects CRDs for `ingress-nginx`, `cert-manager`, and `mongodb-kubernetes-operator`.

## 1. Prod

Deployed to namespace `zuzi-site`. Hostname is `zuzanariha.art`. TLS is managed by cert-manager, using a cluster-issuer named `letsencrypt`, connected to Lets Encrypt, obviously.

## 2. Staging

Deployed to namespace `zuzi-staging`. Hostname is `demo.zuzi.art`. TLS is managed by cert-manager, which expects a cluster-issuer called `ca-issuer` - typically set up to issue self-signed certificates using a CA key pair.

## 3. Dev

Deployed to namespace `zuzi-dev`. Expects to deploy to a local `docker-desktop` kubernetes cluster. Hostname is `zuzi.local` (Use `/etc/hosts` mapping to 127.0.0.1). TLS is used with a self-signed CA. Auto-activates when running `skaffold dev` and the current context name is `docker-desktop`. MongoDB is port-forwarded to localhost on 27017, and a post-deploy script restores a database backup.
