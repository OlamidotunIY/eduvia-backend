# Eduvia Infrastructure & Deployment Guide

This guide contains all the essential commands and architectural details to manage your Azure + Kubernetes (K3s) infrastructure for **Eduvia Backend**.

---

## 🏗️ 1. Makefile Automation (Run on Windows)

These commands are run locally on your machine from the root `eduvia-backend` folder:

| Command | Description |
| :--- | :--- |
| `make start` | **From Scratch:** Provisions the Azure VM, waits for boot, installs Docker/K3s, copies secrets, builds the image, and deploys all Kubernetes pods. |
| `make deploy-stack` | **Fast Update:** Use this if the VM is already running. It checks for secrets, optionally builds the image (if missing), and applies updated Kubernetes YAML files. |
| `make build-image` | **Force Rebuild:** Forces the remote VM to pull your latest git code, rebuild the Docker image, and load it into K3s containerd. |
| `make stop` | **Destroy Everything:** Automatically backs up your MySQL database to your local machine (`eduvia_backup.sql`), then destroys the Azure VM and all disks (Billing = \$0). |
| `make backup-db` | Manually triggers a MySQL database dump from the Kubernetes pod to your local machine. |
| `make restore-db` | Manually pushes your local `eduvia_backup.sql` file into the live MySQL Kubernetes pod. |
| `make ssh` | Instantly logs you into the Azure VM so you can run Kubernetes / debugging commands. |
| `make mysql-tunnel` | Opens an SSH port forward from `localhost:3307` directly to the cluster MySQL service. |
| `make update-dns` | Updates your Cloudflare DNS `A` record for `api.eduvia.name.ng` to point to the VM public IP. |

---

## ☸️ 2. Kubernetes Commands (Run inside the VM)

To run these, first type `make ssh` to enter the remote server. K3s has standard `kubectl` built-in:

### Checking if Apps are Running
* **See all running pods:** `kubectl get pods`
* **See all cluster resources:** `kubectl get all`
* **Check ingress routes:** `kubectl get ingress`

### Viewing Logs (Debugging)
* **Stream live logs for NestJS API:**
  ```bash
  kubectl logs -f -l app=eduvia-app
  ```
* **Stream live logs for MySQL:**
  ```bash
  kubectl logs -f -l app=mysql
  ```
* **Stream live logs for Redis:**
  ```bash
  kubectl logs -f -l app=redis
  ```

### Troubleshooting Crashes
If a pod says `CrashLoopBackOff` or `Error`:
1. Find out the exact pod name: `kubectl get pods`
2. Describe the pod to see events:
   ```bash
   kubectl describe pod <pod-name>
   ```
3. Check the previous crash logs:
   ```bash
   kubectl logs <pod-name> --previous
   ```

### Restarting the Application
To gracefully restart the NestJS API pod:
```bash
kubectl rollout restart deployment/eduvia-app
```

---

## ☁️ 3. Terraform Commands (Run on Windows)

You rarely need to run these manually because `make start` and `make stop` handle them automatically:

| Command | Description |
| :--- | :--- |
| `cd infrastructure/terraform` | Move into the Terraform directory. |
| `terraform output k3s_vm_public_ip` | Prints the exact public IP address of your current Azure VM. |
| `terraform state list` | Lists all the Azure resources currently provisioned. |

---

## 🔐 4. Required Secrets Configuration

Before running `make start` or `make deploy-stack`, ensure the following are configured:

1. **`.env.production`** (in repository root):
   Copy `.env.production.example` to `.env.production` and fill in production secrets (`JWT_SECRET`, `OBSERVABLE_API_KEY`, etc.).
2. **`infrastructure/Firebase/`**:
   Place your Firebase Admin SDK service account key JSON here (e.g. `eduvia-firebase-adminsdk.json`). It will be automatically synced and mounted as a secret inside the pod.
3. **`infrastructure/terraform/terraform.tfvars`**:
   Contains your Azure `subscription_id` and `ssh_public_key`.
